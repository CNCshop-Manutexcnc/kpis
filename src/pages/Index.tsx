import { Wrench, ClipboardList, RefreshCw, Volume2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { KpiCard } from "@/components/KpiCard";
import { MetaCard } from "@/components/MetaCard";
import { StatusChart } from "@/components/StatusChart";
import { RecentOSTable } from "@/components/RecentOSTable";
import { VERSION } from "@/version";
import {
  fetchOSData,
  fetchMetaData,
  getStatusLabCountData,
  type OSRecord,
  type MetaSheetData,
} from "@/data/osData";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const previousMetaSnapshotRef = useRef<MetaSheetData | null>(null);
  const previousOSCountRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioPrimedRef = useRef(false);
  const hideNoticeTimerRef = useRef<number | null>(null);
  const [showMetaUpdateNotice, setShowMetaUpdateNotice] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  const { data: osData = [], isLoading, dataUpdatedAt } = useQuery<OSRecord[]>({
    queryKey: ["osData"],
    queryFn: fetchOSData,
    refetchInterval: 2 * 60 * 1000,
    refetchIntervalInBackground: true,
  });

  const { data: metaData } = useQuery<MetaSheetData>({
    queryKey: ["metaData"],
    queryFn: fetchMetaData,
    refetchInterval: 2 * 60 * 1000,
    refetchIntervalInBackground: true,
  });

  const total = osData.length;
  const aguardando = osData.filter(os => os.statusLab.includes("AGUARDANDO")).length;

  const statusLabData = getStatusLabCountData(osData);

  const lastUpdate = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const getAudioContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtx) return null;

    const context = new AudioCtx();
    audioContextRef.current = context;
    return context;
  }, []);

  const unlockAudio = useCallback(async () => {
    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch {
        // Pode falhar se ainda nao houver gesto do usuario.
      }
    }
  }, [getAudioContext]);

  const primeNotificationAudio = useCallback(async () => {
    if (audioPrimedRef.current) return;

    const audio = notificationAudioRef.current;
    if (!audio) return;

    await unlockAudio();

    try {
      audio.muted = true;
      audio.currentTime = 0;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      audioPrimedRef.current = true;
    } catch {
      audio.muted = false;
    }
  }, [unlockAudio]);

  const playFallbackTone = useCallback(() => {
    const context = getAudioContext();
    if (!context || context.state !== "running") return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.04;

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.15);
  }, []);

  const playMetaUpdatedSound = useCallback(async () => {
    const src = `${import.meta.env.BASE_URL}notification.mp3`;
    const audio = notificationAudioRef.current ?? new Audio(src);
    notificationAudioRef.current = audio;
    audio.volume = 0.7;
    audio.preload = "auto";

    try {
      await unlockAudio();
      audio.currentTime = 0;
      await audio.play();
    } catch {
      // Se autoplay for bloqueado, usa tom curto via AudioContext como fallback.
      playFallbackTone();
    }
  }, [playFallbackTone, unlockAudio]);

  const handleTestSound = useCallback(() => {
    void primeNotificationAudio().then(() => playMetaUpdatedSound());
    toast.success("Teste de som executado.", {
      description: "Se nao ouvir, clique novamente para liberar audio no navegador.",
    });
  }, [playMetaUpdatedSound, primeNotificationAudio]);

  const showUpdateNotice = (message: string) => {
    setUpdateMessage(message);
    setShowMetaUpdateNotice(true);
    if (hideNoticeTimerRef.current) {
      window.clearTimeout(hideNoticeTimerRef.current);
    }
    hideNoticeTimerRef.current = window.setTimeout(() => {
      setShowMetaUpdateNotice(false);
      hideNoticeTimerRef.current = null;
    }, 10000);
  };

  const notifyUpdate = useCallback((message: string, description: string) => {
    void playMetaUpdatedSound();
    showUpdateNotice(message);
    toast.success(message, {
      duration: 10000,
      description,
    });
  }, [playMetaUpdatedSound]);

  useEffect(() => {
    const src = `${import.meta.env.BASE_URL}notification.mp3`;
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = 0.7;
    notificationAudioRef.current = audio;

    void primeNotificationAudio();

    const onUserInteraction = () => {
      void primeNotificationAudio();
    };
    window.addEventListener("pointerdown", onUserInteraction, { passive: true });
    window.addEventListener("keydown", onUserInteraction);

    return () => {
      window.removeEventListener("pointerdown", onUserInteraction);
      window.removeEventListener("keydown", onUserInteraction);
      if (hideNoticeTimerRef.current) {
        window.clearTimeout(hideNoticeTimerRef.current);
      }
      notificationAudioRef.current = null;
      audioPrimedRef.current = false;
    };
  }, [primeNotificationAudio]);

  useEffect(() => {
    if (!metaData) return;

    const previous = previousMetaSnapshotRef.current;

    // Se é a primeira execução, apenas armazena o snapshot
    if (previous === null) {
      previousMetaSnapshotRef.current = {
        laboratorioEletronico: {
          meta: metaData.laboratorioEletronico.meta,
          atual: metaData.laboratorioEletronico.atual,
        },
        laboratorioMotores: {
          meta: metaData.laboratorioMotores.meta,
          atual: metaData.laboratorioMotores.atual,
        },
      };
      return;
    }

    // Detecta mudanças significativas na meta ou valor atual
    const metaChanged =
      Math.abs(metaData.laboratorioEletronico.meta - previous.laboratorioEletronico.meta) >= 0.01 ||
      Math.abs(metaData.laboratorioMotores.meta - previous.laboratorioMotores.meta) >= 0.01;
    const atualChanged =
      Math.abs(metaData.laboratorioEletronico.atual - previous.laboratorioEletronico.atual) >= 0.01 ||
      Math.abs(metaData.laboratorioMotores.atual - previous.laboratorioMotores.atual) >= 0.01;

    if (metaChanged || atualChanged) {
      notifyUpdate("Meta atualizada 🔔", "A planilha de meta foi atualizada.");
      console.log("Meta mudou:", { previous, atual: metaData, metaChanged, atualChanged });
    }

    previousMetaSnapshotRef.current = {
      laboratorioEletronico: {
        meta: metaData.laboratorioEletronico.meta,
        atual: metaData.laboratorioEletronico.atual,
      },
      laboratorioMotores: {
        meta: metaData.laboratorioMotores.meta,
        atual: metaData.laboratorioMotores.atual,
      },
    };
  }, [metaData, notifyUpdate]);

  // Detecta mudanças na planilha de OS
  useEffect(() => {
    if (osData.length === 0) return;

    const previous = previousOSCountRef.current;

    // Se é a primeira execução, apenas armazena o snapshot
    if (previous === null) {
      previousOSCountRef.current = osData.length;
      return;
    }

    // Detecta mudanças no número total de OS ou nos status
    if (osData.length !== previous) {
      notifyUpdate("Planilha atualizada 📋", "A planilha de OS foi atualizada.");
      console.log("OS data mudou:", { anterior: previous, agora: osData.length });
    }

    previousOSCountRef.current = osData.length;
  }, [osData, notifyUpdate]);

  return (
    <div className="min-h-screen bg-background">
      {showMetaUpdateNotice && (
        <div className="fixed top-6 right-6 z-50 rounded-lg border border-green-500 bg-green-900/90 px-4 py-3 text-sm font-semibold text-green-100 shadow-lg backdrop-blur">
          {updateMessage || "Atualizado 🔔"}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-6 xl:px-10 py-4 flex items-center gap-3">
          <div className="bg-white rounded-md px-3 py-1">
            <img src={logo} alt="CNCShop - Grupo Manutex CNC" className="h-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Laboratório Eletrônico</h1>
            <p className="text-sm text-muted-foreground">Dashboard de KPIs — Ordens de Serviço</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full opacity-75">
              v{VERSION}
            </span>
            <button
              type="button"
              onClick={handleTestSound}
              className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary/80"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Testar som
            </button>
            <span className="text-sm text-muted-foreground">
              Últ. atualização: {lastUpdate}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary px-4 py-2 rounded-md">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
              {total} OS ativas
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-6 xl:px-10 py-8 space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mr-3" />
            Carregando dados da planilha…
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <KpiCard title="Total de OS" value={total} icon={<ClipboardList className="h-6 w-6" />} subtitle="Ordens ativas no sistema" />
              <KpiCard title="Aguardando Avaliação" value={aguardando} icon={<Wrench className="h-6 w-6" />} subtitle={`${total > 0 ? ((aguardando / total) * 100).toFixed(0) : 0}% do total`} />
            </div>

            {/* Metas do laboratorio */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {metaData ? (
                <MetaCard
                  title="META LABOTORIO ELETRONICO"
                  meta={metaData.laboratorioEletronico.meta}
                  atual={metaData.laboratorioEletronico.atual}
                />
              ) : (
                <MetaCard title="META LABOTORIO ELETRONICO" meta={0} atual={0} empty />
              )}
              {metaData ? (
                <MetaCard
                  title="META LABORATORIO MOTORES"
                  meta={metaData.laboratorioMotores.meta}
                  atual={metaData.laboratorioMotores.atual}
                />
              ) : (
                <MetaCard title="META LABORATORIO MOTORES" meta={0} atual={0} empty />
              )}
            </div>

            {/* Chart: Status Lab */}
            <StatusChart data={statusLabData} title="Status do Laboratório" layout="vertical" />

            {/* Tabela: OS Aguardando Avaliação */}
            <RecentOSTable data={osData} />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
