import { Wrench, ClipboardList, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { KpiCard } from "@/components/KpiCard";
import { MetaCard } from "@/components/MetaCard";
import { StatusChart } from "@/components/StatusChart";
import { RecentOSTable } from "@/components/RecentOSTable";
import {
  fetchOSData,
  fetchMetaData,
  getStatusLabCountData,
  type OSRecord,
  type MetaRecord,
} from "@/data/osData";
import { useQuery } from "@tanstack/react-query";

const AUDIO_ENABLED_STORAGE_KEY = "kpis-audio-enabled";

const Index = () => {
  const previousMetaSnapshotRef = useRef<MetaRecord | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hideNoticeTimerRef = useRef<number | null>(null);
  const [showMetaUpdateNotice, setShowMetaUpdateNotice] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [hasAudioPreference, setHasAudioPreference] = useState(false);

  const { data: osData = [], isLoading, dataUpdatedAt } = useQuery<OSRecord[]>({
    queryKey: ["osData"],
    queryFn: fetchOSData,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: true,
  });

  const { data: metaData } = useQuery<MetaRecord>({
    queryKey: ["metaData"],
    queryFn: fetchMetaData,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: true,
  });

  const total = osData.length;
  const aguardando = osData.filter(os => os.statusLab.includes("AGUARDANDO")).length;

  const statusLabData = getStatusLabCountData(osData);

  const lastUpdate = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const getAudioContext = () => {
    if (audioContextRef.current) return audioContextRef.current;

    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtx) return null;

    const context = new AudioCtx();
    audioContextRef.current = context;
    setIsAudioReady(context.state === "running");
    return context;
  };

  const unlockAudio = (persistPreference = false) => {
    const context = getAudioContext();
    if (!context) return;

    const afterResume = () => {
      const running = context.state === "running";
      setIsAudioReady(running);
      if (persistPreference && running) {
        setHasAudioPreference(true);
        try {
          localStorage.setItem(AUDIO_ENABLED_STORAGE_KEY, "1");
        } catch {
          // Em modo privado pode falhar, sem impedir o funcionamento do app.
        }
      }
    };

    if (context.state === "suspended") {
      void context.resume().then(afterResume).catch(() => undefined);
      return;
    }

    afterResume();
  };

  const playMetaUpdatedSound = () => {
    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
      void context.resume().catch(() => undefined);
    }

    const playTone = (startOffset: number, frequency: number, duration: number, gainLevel: number) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      const startAt = context.currentTime + startOffset;
      const endAt = startAt + duration;

      osc.connect(gain);
      gain.connect(context.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0.001, startAt);
      gain.gain.exponentialRampToValueAtTime(gainLevel, startAt + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, endAt);

      osc.start(startAt);
      osc.stop(endAt + 0.01);
    };

    playTone(0.0, 880, 0.11, 0.85);
    playTone(0.12, 1046, 0.11, 0.85);
    playTone(0.24, 1318, 0.16, 0.9);
  };

  const showVisualNotice = () => {
    setShowMetaUpdateNotice(true);
    if (hideNoticeTimerRef.current) {
      window.clearTimeout(hideNoticeTimerRef.current);
    }
    hideNoticeTimerRef.current = window.setTimeout(() => {
      setShowMetaUpdateNotice(false);
      hideNoticeTimerRef.current = null;
    }, 10000);
  };

  useEffect(() => {
    try {
      setHasAudioPreference(localStorage.getItem(AUDIO_ENABLED_STORAGE_KEY) === "1");
    } catch {
      setHasAudioPreference(false);
    }

    const onUserInteraction = () => unlockAudio();
    window.addEventListener("pointerdown", onUserInteraction, { passive: true });
    window.addEventListener("keydown", onUserInteraction);

    return () => {
      window.removeEventListener("pointerdown", onUserInteraction);
      window.removeEventListener("keydown", onUserInteraction);
      if (hideNoticeTimerRef.current) {
        window.clearTimeout(hideNoticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!metaData) return;

    const previous = previousMetaSnapshotRef.current;
    const changed =
      previous !== null &&
      (Math.abs(metaData.meta - previous.meta) > 0.0001 ||
        Math.abs(metaData.atual - previous.atual) > 0.0001);

    if (changed) {
      try {
        playMetaUpdatedSound();
      } catch {
        // Em alguns navegadores o autoplay pode ser bloqueado sem interação do usuário.
      }

      showVisualNotice();
      toast.success("Meta atualizada 🔔", {
        duration: 10000,
        description: "Os valores da planilha foram atualizados.",
      });
    }

    previousMetaSnapshotRef.current = { meta: metaData.meta, atual: metaData.atual };
  }, [metaData]);

  return (
    <div className="min-h-screen bg-background">
      {showMetaUpdateNotice && (
        <div className="fixed top-6 right-6 z-50 rounded-lg border border-green-500 bg-green-900/90 px-4 py-3 text-sm font-semibold text-green-100 shadow-lg backdrop-blur">
          Meta atualizada 🔔
        </div>
      )}

      {!isAudioReady && !hasAudioPreference && (
        <button
          type="button"
          onClick={() => unlockAudio(true)}
          className="fixed bottom-6 right-6 z-50 rounded-lg border border-amber-400 bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 shadow-lg"
        >
          Ativar som
        </button>
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

            {/* Meta Mensal */}
            {metaData && <MetaCard meta={metaData.meta} atual={metaData.atual} />}

            {/* Chart: Status Lab */}
            <StatusChart data={statusLabData} title="Status do Laboratório (Contagem)" layout="vertical" />

            {/* Tabela: OS Aguardando Avaliação */}
            <RecentOSTable data={osData} />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
