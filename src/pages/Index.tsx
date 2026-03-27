import { Wrench, ClipboardList, RefreshCw } from "lucide-react";
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
  type MetaRecord,
} from "@/data/osData";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const previousMetaSnapshotRef = useRef<MetaRecord | null>(null);
  const previousOSCountRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hideNoticeTimerRef = useRef<number | null>(null);
  const [showMetaUpdateNotice, setShowMetaUpdateNotice] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

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
    return context;
  };

  const unlockAudio = useCallback(() => {
    const context = getAudioContext();
    if (!context) return;

    const afterResume = () => {
      // Contexto pronto para tocar som quando houver atualização de meta.
    };

    if (context.state === "suspended") {
      void context.resume().then(afterResume).catch(() => undefined);
      return;
    }

    afterResume();
  }, []);

  const playMetaUpdatedSound = () => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.volume = 0.7;
      void audio.play();
    } catch {
      // Falha de áudio sem impedir funcionamento do app
    }
  };

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
    try {
      playMetaUpdatedSound();
    } catch {
      // Em alguns navegadores o autoplay pode ser bloqueado sem interação do usuário.
    }
    showUpdateNotice(message);
    toast.success(message, {
      duration: 10000,
      description,
    });
  }, []);

  useEffect(() => {
    unlockAudio();

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
  }, [unlockAudio]);

  useEffect(() => {
    if (!metaData) return;

    const previous = previousMetaSnapshotRef.current;
    
    // Se é a primeira execução, apenas armazena o snapshot
    if (previous === null) {
      previousMetaSnapshotRef.current = { meta: metaData.meta, atual: metaData.atual };
      return;
    }

    // Detecta mudanças significativas na meta ou valor atual
    const metaChanged = Math.abs(metaData.meta - previous.meta) >= 0.01;
    const atualChanged = Math.abs(metaData.atual - previous.atual) >= 0.01;

    if (metaChanged || atualChanged) {
      const changes = [];
      if (metaChanged) changes.push(`meta: ${previous.meta.toFixed(2)} → ${metaData.meta.toFixed(2)}`);
      if (atualChanged) changes.push(`atual: ${previous.atual.toFixed(2)} → ${metaData.atual.toFixed(2)}`);
      
      notifyUpdate("Meta atualizada 🔔", `Mudança: ${changes.join(", ")}`);
      console.log("Meta mudou:", { previous, atual: metaData, changes });
    }

    previousMetaSnapshotRef.current = { meta: metaData.meta, atual: metaData.atual };
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
      const change = osData.length > previous ? "adicionada" : "removida";
      const diff = Math.abs(osData.length - previous);
      notifyUpdate("Planilha atualizada 📋", `${diff} OS ${change}${diff > 1 ? "s" : ""}`);
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
