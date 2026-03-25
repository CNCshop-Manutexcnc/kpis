import { Wrench, ClipboardList, RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";
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

const Index = () => {
  const previousMetaSnapshotRef = useRef<MetaRecord | null>(null);

  const { data: osData = [], isLoading, dataUpdatedAt } = useQuery<OSRecord[]>({
    queryKey: ["osData"],
    queryFn: fetchOSData,
    refetchInterval: 60 * 1000,
  });

  const { data: metaData } = useQuery<MetaRecord>({
    queryKey: ["metaData"],
    queryFn: fetchMetaData,
    refetchInterval: 60 * 1000,
  });

  const total = osData.length;
  const aguardando = osData.filter(os => os.statusLab.includes("AGUARDANDO")).length;

  const statusLabData = getStatusLabCountData(osData);

  const lastUpdate = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "—";

  useEffect(() => {
    if (!metaData) return;

    const previous = previousMetaSnapshotRef.current;
    const changed =
      previous !== null &&
      (Math.abs(metaData.meta - previous.meta) > 0.0001 ||
        Math.abs(metaData.atual - previous.atual) > 0.0001);

    if (changed) {
      try {
        const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const audioContext = new AudioCtx();
          const playTone = (startOffset: number, frequency: number, duration: number, gainLevel: number) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const startAt = audioContext.currentTime + startOffset;
            const endAt = startAt + duration;

            osc.connect(gain);
            gain.connect(audioContext.destination);

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
        }
      } catch {
        // Em alguns navegadores o autoplay pode ser bloqueado sem interação do usuário.
      }

      toast.success("Meta atualizada 🔔", {
        duration: 10000,
        description: "Os valores da planilha foram atualizados.",
      });
    }

    previousMetaSnapshotRef.current = { meta: metaData.meta, atual: metaData.atual };
  }, [metaData]);

  return (
    <div className="min-h-screen bg-background">
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
