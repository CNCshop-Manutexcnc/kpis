import type { OSRecord } from "@/data/osData";

interface RecentOSTableProps {
  data: OSRecord[];
}

const STATUS_OS_ORDER = ["URGENTE", "PRONTO", "AGUARDANDO APROVACAO"] as const;

function normalizeStatus(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

function getStatusOSBucket(status: string): (typeof STATUS_OS_ORDER)[number] | null {
  const normalized = normalizeStatus(status);

  if (normalized.includes("URGENTE")) return "URGENTE";
  if (normalized.includes("PRONTO")) return "PRONTO";
  if (normalized.includes("AGUARDANDO") && normalized.includes("APROVACAO")) return "AGUARDANDO APROVACAO";

  return null;
}

function getStatusOSLabel(status: string): string {
  const bucket = getStatusOSBucket(status);

  if (bucket === "URGENTE") return "Urgente";
  if (bucket === "PRONTO") return "Prontos";
  if (bucket === "AGUARDANDO APROVACAO") return "Aguardando aprovação";

  return status;
}

function getStatusOSPriority(status: string): number {
  const bucket = getStatusOSBucket(status);
  if (bucket === "URGENTE") return 0;
  if (bucket === "PRONTO") return 1;
  if (bucket === "AGUARDANDO APROVACAO") return 2;
  return 3;
}

function statusBadge(status: string) {
  if (!status) return <span className="text-muted-foreground text-xs">—</span>;

  const bucket = getStatusOSBucket(status);

  let classes = "inline-flex items-center px-2.5 py-1 rounded text-[11px] xl:text-xs font-medium uppercase tracking-wide ";
  if (bucket === "URGENTE") classes += "bg-destructive/20 text-destructive";
  else if (bucket === "PRONTO") classes += "bg-success/20 text-success";
  else if (bucket === "AGUARDANDO APROVACAO") classes += "bg-warning/20 text-warning";
  else classes += "bg-secondary text-secondary-foreground";

  const label = getStatusOSLabel(status);

  return <span className={classes}>{label.length > 28 ? label.slice(0, 28) + "…" : label}</span>;
}

function labBadge(status: string) {
  if (!status) return <span className="text-muted-foreground text-xs">—</span>;
  let classes = "inline-flex items-center px-2.5 py-1 rounded text-[11px] xl:text-xs font-medium uppercase tracking-wide bg-primary/15 text-primary";
  return <span className={classes}>{status.length > 30 ? status.slice(0, 30) + "…" : status}</span>;
}

export function RecentOSTable({ data }: RecentOSTableProps) {
  const aguardando = data
    .filter(os => os.statusLab.includes("AGUARDANDO"))
    .sort((a, b) => {
      const priorityDiff = getStatusOSPriority(a.statusOS) - getStatusOSPriority(b.statusOS);
      if (priorityDiff !== 0) return priorityDiff;

      return a.numero.localeCompare(b.numero, "pt-BR", { numeric: true, sensitivity: "base" });
    });

  return (
    <div className="rounded-lg bg-card border border-border p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm xl:text-base font-medium uppercase tracking-wider text-muted-foreground">
          OS Aguardando Avaliação
        </h3>
        <span className="text-xs xl:text-sm font-mono bg-warning/15 text-warning px-3 py-1.5 rounded">
          {aguardando.length} registros
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm xl:text-base">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 text-xs xl:text-sm font-medium text-muted-foreground uppercase tracking-wider">OS</th>
              <th className="text-left py-3 px-3 text-xs xl:text-sm font-medium text-muted-foreground uppercase tracking-wider">Seq</th>
              <th className="text-left py-3 px-3 text-xs xl:text-sm font-medium text-muted-foreground uppercase tracking-wider">Status OS</th>
              <th className="text-left py-3 px-3 text-xs xl:text-sm font-medium text-muted-foreground uppercase tracking-wider">Status Lab</th>
              <th className="text-left py-3 px-3 text-xs xl:text-sm font-medium text-muted-foreground uppercase tracking-wider">Descrição</th>
              <th className="text-left py-3 px-3 text-xs xl:text-sm font-medium text-muted-foreground uppercase tracking-wider">Nº Série</th>
              <th className="text-left py-3 px-3 text-xs xl:text-sm font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
              <th className="text-left py-3 px-3 text-xs xl:text-sm font-medium text-muted-foreground uppercase tracking-wider">Cidade/UF</th>
            </tr>
          </thead>
          <tbody>
            {aguardando.map(os => (
              <tr key={`${os.numero}-${os.seq}`} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="py-3 px-3 font-mono text-primary font-semibold">{os.numero}</td>
                <td className="py-3 px-3 font-mono text-muted-foreground">{os.seq || "—"}</td>
                <td className="py-3 px-3">{statusBadge(os.statusOS)}</td>
                <td className="py-3 px-3">{labBadge(os.statusLab)}</td>
                <td className="py-3 px-3 text-foreground max-w-[300px] truncate">{os.descricao}</td>
                <td className="py-3 px-3 font-mono text-muted-foreground text-xs xl:text-sm">{os.numSerie || "—"}</td>
                <td className="py-3 px-3 text-muted-foreground max-w-[280px] truncate">{os.razaoSocial}</td>
                <td className="py-3 px-3 text-muted-foreground text-xs xl:text-sm whitespace-nowrap">{os.cidade}{os.uf ? `/${os.uf}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
