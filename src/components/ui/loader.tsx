"use client";

interface LoaderProps {
  /** Plein écran avec fond noir, ou petit loader inline (dans un bouton, une carte...) */
  fullScreen?: boolean;
  /** Texte affiché sous l'animation (mode plein écran uniquement) */
  label?: string;
  /** Taille du loader compact, en pixels (mode inline uniquement) */
  size?: number;
  /** Couleur principale du loader */
  color?: string;
}

function Loader({
  fullScreen = true,
  label = "Chargement…",
  size = 22,
  color = "#3B82F6",
}: LoaderProps) {
  const irisId = `irisGradient-${color.replace("#", "")}`;
  const clipId = `eyeClip-${color.replace("#", "")}`;
  const glowId = `eyeGlow-${color.replace("#", "")}`;

  const EyeSvg = ({ compact }: { compact: boolean }) => (
    <svg viewBox="0 0 100 64" className={compact ? "eye-svg-compact" : "eye-svg"} aria-hidden="true">
      <defs>
        <radialGradient id={irisId} cx="35%" cy="35%" r="75%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="60%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </radialGradient>
        <clipPath id={clipId}>
          <path d="M8,38 Q50,6 92,38 Q50,58 8,38 Z" />
        </clipPath>
        {!compact && (
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        )}
      </defs>

      {!compact && (
        <ellipse
          className="eye-glow"
          cx="50" cy="32" rx="46" ry="30"
          fill={color}
          filter={`url(#${glowId})`}
        />
      )}

      <g className="eye-blink">
        {/* Contour de la paupière */}
        <path
          className="eye-lid"
          d="M8,38 Q50,6 92,38 Q50,58 8,38 Z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Iris + pupille, découpés proprement par la forme de l'œil */}
        <g clipPath={`url(#${clipId})`}>
          <circle cx="50" cy="36" r="16" fill={`url(#${irisId})`} />
          <circle cx="46" cy="33" r="7.5" fill="#0a0a12" />
          <circle className="eye-spark" cx="42" cy="28" r="2.3" fill="#ffffff" />
          <circle className="eye-spark eye-spark-soft" cx="50" cy="38" r="1.1" fill="#ffffff" />
        </g>
      </g>
    </svg>
  );

  // ===== MODE COMPACT : pour les boutons =====
  if (!fullScreen) {
    const width = size * 1.6;
    const height = size;
    return (
      <div
        className="eye-compact-wrap"
        style={{ width, height }}
        role="status"
        aria-label="Chargement"
      >
        <EyeSvg compact />
        <style>{`
          .eye-compact-wrap { position: relative; margin: 0 auto; }
          .eye-svg-compact { width: 100%; height: 100%; overflow: visible; }
          .eye-blink {
            transform-box: fill-box;
            transform-origin: center;
            animation: eye-blink-cycle 3s ease-in-out infinite;
          }
          .eye-spark { opacity: 0.9; }
          @keyframes eye-blink-cycle {
            0%, 88%   { transform: scaleY(1); }
            91%       { transform: scaleY(0.05); }
            94%       { transform: scaleY(1); }
            100%      { transform: scaleY(1); }
          }
          @media (prefers-reduced-motion: reduce) {
            .eye-blink { animation: none; }
          }
        `}</style>
      </div>
    );
  }

  // ===== MODE PLEIN ÉCRAN =====
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-black select-none">
      <div className="eye-wrap" role="status" aria-label="Chargement">
        <EyeSvg compact={false} />

        <style>{`
          .eye-wrap { width: 168px; }
          .eye-svg { width: 100%; height: auto; overflow: visible; }

          .eye-glow {
            animation: glow-breathe 3.2s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }

          .eye-blink {
            transform-box: fill-box;
            transform-origin: center;
            animation: eye-blink-cycle 3.2s ease-in-out infinite;
            filter: drop-shadow(0 0 10px ${color}55);
          }

          .eye-lid {
            stroke-dasharray: 190;
            stroke-dashoffset: 190;
            animation: lid-draw-in 1.1s ease-out forwards;
          }

          .eye-spark {
            animation: spark-pulse 2.6s ease-in-out infinite;
          }
          .eye-spark-soft {
            animation-delay: 0.4s;
            opacity: 0.5;
          }

          @keyframes lid-draw-in {
            0%   { stroke-dashoffset: 190; }
            100% { stroke-dashoffset: 0; }
          }

          @keyframes eye-blink-cycle {
            0%, 88%   { transform: scaleY(1); }
            91%       { transform: scaleY(0.05); }
            94%       { transform: scaleY(1); }
            100%      { transform: scaleY(1); }
          }

          @keyframes glow-breathe {
            0%, 100% { opacity: 0.18; transform: scale(1); }
            50%      { opacity: 0.32; transform: scale(1.08); }
          }

          @keyframes spark-pulse {
            0%, 100% { opacity: 0.6; }
            50%      { opacity: 1; }
          }

          @media (prefers-reduced-motion: reduce) {
            .eye-blink, .eye-glow, .eye-spark, .eye-lid {
              animation: none;
            }
            .eye-lid { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>

      {label && (
        <div className="mt-7 flex flex-col items-center">
          <p className="text-zinc-300 text-xs font-semibold tracking-[0.2em] uppercase">
            {label}
          </p>
          <svg width="120" height="10" viewBox="0 0 120 10" className="mt-2" aria-hidden="true">
            <path
              d="M2 6 C 20 2, 35 8, 55 5 S 90 2, 118 6"
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              className="brush-underline"
            />
          </svg>
        </div>
      )}

      <style>{`
        .brush-underline {
          stroke-dasharray: 140;
          stroke-dashoffset: 140;
          animation: brush-draw 3.2s ease-in-out infinite;
        }
        @keyframes brush-draw {
          0%, 4%   { stroke-dashoffset: 140; opacity: 0; }
          14%      { opacity: 1; }
          40%      { stroke-dashoffset: 0; opacity: 1; }
          62%, 100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .brush-underline { animation: none; stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export { Loader };
export default Loader;