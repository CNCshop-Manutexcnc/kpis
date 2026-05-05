import { Target } from "lucide-react";
import { useMemo, type CSSProperties } from "react";

type LabType = "motores" | "eletronico";

interface MetaCardProps {
  title: string;
  meta: number;
  atual: number;
  empty?: boolean;
  labType?: LabType;
}

function MotorIcon() {
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true" className="meta-progress-svg">
      <defs>
        <linearGradient id="metaMotorBlock" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#cb7a06" />
          <stop offset="100%" stopColor="#ffc95b" />
        </linearGradient>
        <linearGradient id="metaMotorHead" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe0a0" />
          <stop offset="100%" stopColor="#ec9f20" />
        </linearGradient>
        <linearGradient id="metaMotorSteel" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#c7cfde" />
          <stop offset="100%" stopColor="#7d879d" />
        </linearGradient>
      </defs>
      <rect x="18" y="56" width="72" height="6" rx="3" fill="#4d3310" opacity="0.75" />
      <rect x="22" y="24" width="58" height="28" rx="7" fill="url(#metaMotorBlock)" />
      <rect x="30" y="18" width="42" height="9" rx="3" fill="url(#metaMotorHead)" />
      <rect x="24" y="28" width="54" height="3" rx="2" fill="#8b5107" opacity="0.55" />
      <rect x="24" y="34" width="54" height="3" rx="2" fill="#8b5107" opacity="0.55" />
      <rect x="24" y="40" width="54" height="3" rx="2" fill="#8b5107" opacity="0.55" />

      <rect x="80" y="30" width="14" height="16" rx="3" fill="#f2a31b" />
      <rect x="92" y="33" width="9" height="10" rx="2" fill="url(#metaMotorSteel)" />
      <rect x="99" y="36" width="8" height="4" rx="2" fill="#8a95ac" />

      <rect x="43" y="46" width="16" height="4" rx="2" fill="url(#metaMotorSteel)" />
      <circle cx="51" cy="48" r="3" fill="#75809a" />
      <circle cx="30" cy="32" r="2.3" fill="#6f4306" />
      <circle cx="44" cy="32" r="2.3" fill="#6f4306" />
      <circle cx="58" cy="32" r="2.3" fill="#6f4306" />

      <g className="meta-wheel">
        <circle cx="38" cy="64" r="8" fill="#1f2430" />
        <circle cx="38" cy="64" r="4.6" fill="#6f7688" />
        <line x1="38" y1="56" x2="38" y2="72" stroke="#d1d6e2" strokeWidth="2" />
        <line x1="30" y1="64" x2="46" y2="64" stroke="#d1d6e2" strokeWidth="2" />
      </g>

      <g className="meta-wheel">
        <circle cx="78" cy="64" r="8" fill="#1f2430" />
        <circle cx="78" cy="64" r="4.6" fill="#6f7688" />
        <line x1="78" y1="56" x2="78" y2="72" stroke="#d1d6e2" strokeWidth="2" />
        <line x1="70" y1="64" x2="86" y2="64" stroke="#d1d6e2" strokeWidth="2" />
      </g>
    </svg>
  );
}

function ElectronicsIcon() {
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true" className="meta-progress-svg">
      <defs>
        <linearGradient id="metaChipBody" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#0a2b40" />
          <stop offset="100%" stopColor="#0f415f" />
        </linearGradient>
        <linearGradient id="metaChipCore" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#14435f" />
          <stop offset="100%" stopColor="#1b5e80" />
        </linearGradient>
      </defs>

      <g className="meta-chip">
        <rect x="24" y="18" width="72" height="48" rx="10" fill="url(#metaChipBody)" stroke="#2ad5ff" strokeWidth="2" />
        <rect x="37" y="30" width="46" height="24" rx="5" fill="url(#metaChipCore)" stroke="#84ecff" strokeWidth="1.5" />
        <rect x="42" y="35" width="36" height="14" rx="3" fill="#0b2a3f" stroke="#62daf8" strokeWidth="1" />

        <line x1="50" y1="26" x2="50" y2="30" className="meta-trace" stroke="#47dfff" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="60" y1="26" x2="60" y2="30" className="meta-trace" stroke="#47dfff" strokeWidth="1.8" strokeLinecap="round" style={{ animationDelay: "0.2s" }} />
        <line x1="70" y1="26" x2="70" y2="30" className="meta-trace" stroke="#47dfff" strokeWidth="1.8" strokeLinecap="round" style={{ animationDelay: "0.4s" }} />

        <line x1="50" y1="54" x2="50" y2="58" className="meta-trace" stroke="#47dfff" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="60" y1="54" x2="60" y2="58" className="meta-trace" stroke="#47dfff" strokeWidth="1.8" strokeLinecap="round" style={{ animationDelay: "0.2s" }} />
        <line x1="70" y1="54" x2="70" y2="58" className="meta-trace" stroke="#47dfff" strokeWidth="1.8" strokeLinecap="round" style={{ animationDelay: "0.4s" }} />

        <line x1="34" y1="40" x2="37" y2="40" className="meta-trace" stroke="#47dfff" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="34" y1="46" x2="37" y2="46" className="meta-trace" stroke="#47dfff" strokeWidth="1.8" strokeLinecap="round" style={{ animationDelay: "0.3s" }} />
        <line x1="83" y1="40" x2="86" y2="40" className="meta-trace" stroke="#47dfff" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="83" y1="46" x2="86" y2="46" className="meta-trace" stroke="#47dfff" strokeWidth="1.8" strokeLinecap="round" style={{ animationDelay: "0.3s" }} />

        <circle cx="48" cy="42" r="2.3" fill="#8ce8ff" className="meta-energy-dot" />
        <circle cx="60" cy="42" r="2.5" fill="#c5f5ff" className="meta-energy-core" style={{ animationDelay: "0.15s" }} />
        <circle cx="72" cy="42" r="2.3" fill="#8ce8ff" className="meta-energy-dot" style={{ animationDelay: "0.3s" }} />
      </g>

      <g stroke="#42dcff" strokeWidth="2" strokeLinecap="round">
        <line x1="17" y1="28" x2="24" y2="28" />
        <line x1="17" y1="38" x2="24" y2="38" />
        <line x1="17" y1="48" x2="24" y2="48" />
        <line x1="17" y1="58" x2="24" y2="58" />
        <line x1="96" y1="28" x2="103" y2="28" />
        <line x1="96" y1="38" x2="103" y2="38" />
        <line x1="96" y1="48" x2="103" y2="48" />
        <line x1="96" y1="58" x2="103" y2="58" />
      </g>

      <rect x="34" y="58" width="52" height="4" rx="2" fill="#1a4a63" opacity="0.85" />

      <g className="meta-wheel">
        <circle cx="43" cy="68" r="8" fill="#162434" />
        <circle cx="43" cy="68" r="4.6" fill="#7edff7" />
        <line x1="43" y1="60" x2="43" y2="76" stroke="#d6f7ff" strokeWidth="1.5" />
        <line x1="35" y1="68" x2="51" y2="68" stroke="#d6f7ff" strokeWidth="1.5" />
      </g>

      <g className="meta-wheel">
        <circle cx="77" cy="68" r="8" fill="#162434" />
        <circle cx="77" cy="68" r="4.6" fill="#7edff7" />
        <line x1="77" y1="60" x2="77" y2="76" stroke="#d6f7ff" strokeWidth="1.5" />
        <line x1="69" y1="68" x2="85" y2="68" stroke="#d6f7ff" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export function MetaCard({ title, meta, atual, empty = false, labType = "eletronico" }: MetaCardProps) {
  const percent = meta > 0 ? Math.min((atual / meta) * 100, 100) : 0;
  const showConfetti = percent >= 100;
  const safePercent = empty ? 0 : percent;
  const iconLeft = `${safePercent}%`;
  const isMotor = labType === "motores";

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
    if (empty) return "Aguardando dados";
    if (percent >= 100) return "Meta alcançada! 🎉";
    return "Estamos quase lá";
  };

  const getLabelClass = () => {
    if (empty) return "text-muted-foreground";
    if (percent >= 100) return "text-success";
    return "text-accent";
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-card border border-border p-4 xl:p-5 animate-slide-up group hover:border-primary/30 transition-colors col-span-1">
      {showConfetti && (
        <div className="meta-confetti-layer" aria-hidden="true">
          {confettiPieces.map(piece => (
            <span key={piece.key} className="meta-confetti-piece" style={piece.style} />
          ))}
        </div>
      )}
      <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-60" />
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <p className="text-lg xl:text-2xl font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl xl:text-5xl font-bold font-mono text-foreground">
            {empty ? "—" : `${percent.toFixed(1)}%`}
          </p>
          <p className={`text-sm xl:text-base font-medium flex items-center gap-1.5 ${getLabelClass()}`}>
            {empty ? (
              <span>Sem fonte de dados</span>
            ) : percent >= 100 ? (
              <>
                <span>Meta alcançada!</span>
                <span className="text-lg leading-none">🎉</span>
              </>
            ) : (
              getLabel()
            )}
          </p>
        </div>
        <div className="p-2 rounded-md bg-secondary text-accent">
          <Target className="h-5 w-5 xl:h-6 xl:w-6" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="meta-progress-shell">
        <div
          className={`meta-progress-icon ${isMotor ? "meta-progress-icon--motor" : "meta-progress-icon--electronics"}`}
          style={{ left: iconLeft }}
          aria-hidden="true"
        >
          <span className="meta-icon-trail" />
          <div className="meta-progress-icon-inner">
            {isMotor ? <MotorIcon /> : <ElectronicsIcon />}
          </div>
        </div>

        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden border border-destructive/40 relative">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${getColor()} ${safePercent > 1 ? "meta-progress-fill-tip" : ""}`}
            style={{ width: `${safePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
