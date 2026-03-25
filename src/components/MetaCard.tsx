import { Target } from "lucide-react";
import { useMemo, type CSSProperties } from "react";

interface MetaCardProps {
  meta: number;
  atual: number;
}

export function MetaCard({ meta, atual }: MetaCardProps) {
  const percent = meta > 0 ? Math.min((atual / meta) * 100, 100) : 0;
  const showConfetti = percent >= 100;

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 56 }, (_, index) => {
        const colors = ["#2dd4bf", "#f59e0b", "#60a5fa", "#f43f5e", "#f8fafc"];
        const left = Math.random() * 100;
        const delay = Math.random() * 1.2;
        const duration = 1.8 + Math.random() * 1.4;
        const size = 6 + Math.random() * 8;

        return {
          key: `meta-confetti-${index}`,
          style: {
            left: `${left}%`,
            backgroundColor: colors[index % colors.length],
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            width: `${size}px`,
            height: `${size * 1.6}px`,
          } satisfies CSSProperties,
        };
      }),
    []
  );

  const getColor = () => {
    if (percent >= 80) return "bg-primary";
    if (percent >= 50) return "bg-accent";
    return "bg-destructive";
  };

  const getLabel = () => {
    if (percent >= 100) return "Meta atingida! 🎉";
    if (percent >= 80) return "Quase lá!";
    if (percent >= 50) return "Em progresso";
    return "Atenção — meta distante";
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-card border border-border p-6 xl:p-8 animate-slide-up group hover:border-primary/30 transition-colors col-span-1 sm:col-span-2">
      {showConfetti && (
        <div className="meta-confetti-layer" aria-hidden="true">
          {confettiPieces.map(piece => (
            <span key={piece.key} className="meta-confetti-piece" style={piece.style} />
          ))}
        </div>
      )}
      <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-60" />
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <p className="text-xs xl:text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Meta Mensal
          </p>
          <p className="text-3xl xl:text-5xl font-bold font-mono text-foreground">
            {percent.toFixed(1)}%
          </p>
          <p className="text-sm xl:text-base text-muted-foreground font-medium flex items-center gap-1.5">
            {percent >= 100 ? (
              <>
                <span>Meta atingida!</span>
                <span className="text-lg leading-none">🎉</span>
              </>
            ) : (
              getLabel()
            )}
          </p>
        </div>
        <div className="p-2 rounded-md bg-secondary text-accent">
          <Target className="h-6 w-6" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getColor()}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        <span>{percent.toFixed(1)}%</span>
      </div>
    </div>
  );
}
