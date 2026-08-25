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
  const gradientId = `inkGradient-${color.replace("#", "")}`;

  // Génère les lignes de vitesse (convention manga : traits radiants à l'impact)
  const speedLines = Array.from({ length: 10 }, (_, i) => {
    const angle = (360 / 10) * i;
    return (
      <div
        key={i}
        className="speed-line"
        style={{
          transform: `rotate(${angle}deg)`,
          animationDelay: `${1.8 * 0.54}s`,
        }}
      />
    );
  });

  const drop = (
    <div
      className={`ink-loader ${fullScreen ? "is-full" : "is-compact"}`}
      style={!fullScreen ? { width: size, height: size * 1.6 } : undefined}
      role="status"
      aria-label="Chargement"
    >
      {fullScreen && <div className="halftone" aria-hidden="true" />}

      {fullScreen && (
        <div className="speed-burst" aria-hidden="true">
          {speedLines}
        </div>
      )}

      <svg viewBox="0 0 40 64" className="ink-drop" aria-hidden="true">
        <path
          d="M20 2 C20 2 4 26 4 40 C4 51 11 58 20 58 C29 58 36 51 36 40 C36 26 20 2 20 2 Z"
          fill={`url(#${gradientId})`}
        />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.85" />
            <stop offset="55%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      <span className="ink-ripple ink-ripple-1" style={{ borderColor: color }} />
      <span className="ink-ripple ink-ripple-2" style={{ borderColor: color }} />
      {fullScreen && (
        <span className="ink-ripple ink-ripple-3" style={{ borderColor: color }} />
      )}

      <style jsx>{`
        .ink-loader {
          position: relative;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .is-full {
          width: 96px;
          height: 96px;
        }
        .is-compact {
          width: ${size}px;
          height: ${size * 1.6}px;
        }

        /* ===== TRAME DE DEMI-TEINTES (grain d'impression manga) ===== */
        .halftone {
          position: absolute;
          inset: -30px;
          border-radius: 9999px;
          background-image: radial-gradient(${color}33 1px, transparent 1.4px);
          background-size: 7px 7px;
          -webkit-mask-image: radial-gradient(circle, black 0%, transparent 72%);
          mask-image: radial-gradient(circle, black 0%, transparent 72%);
          animation: halftone-breathe 3.6s ease-in-out infinite;
        }

        /* ===== LIGNES DE VITESSE (langage manga : impact) ===== */
        .speed-burst {
          position: absolute;
          inset: 0;
        }
        .speed-line {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 6px;
          background: ${color};
          transform-origin: 0 0;
          opacity: 0;
          animation: speed-shoot 1.8s ease-out infinite;
        }

        /* ===== GOUTTE D'ENCRE ===== */
        .ink-drop {
          position: absolute;
          left: 50%;
          bottom: 26%;
          width: 34%;
          height: 34%;
          transform-origin: 50% 100%;
          transform: translateX(-50%);
          animation: ink-fall 1.8s cubic-bezier(0.55, 0, 0.85, 0.35) infinite;
          filter: drop-shadow(0 0 8px ${color}66);
          will-change: transform, opacity;
        }
        .is-compact .ink-drop {
          bottom: 8%;
          width: 62%;
          height: 62%;
        }

        /* ===== ONDES D'ENCRE ===== */
        .ink-ripple {
          position: absolute;
          left: 50%;
          bottom: 22%;
          width: 22%;
          height: 8%;
          border-radius: 50%;
          border: 1.5px solid ${color};
          transform: translate(-50%, 50%) scale(0.3);
          opacity: 0;
          animation: ink-ripple 1.8s ease-out infinite;
          will-change: transform, opacity;
        }
        .is-compact .ink-ripple {
          bottom: 6%;
          width: 40%;
          height: 14%;
        }
        .ink-ripple-2 {
          animation-delay: 0.15s;
          border-color: ${color}cc;
        }
        .ink-ripple-3 {
          animation-delay: 0.3s;
          border-color: ${color}88;
        }

        @keyframes ink-fall {
          0% { transform: translateX(-50%) translateY(-160%) scale(1); opacity: 0; }
          14% { opacity: 1; }
          54% { transform: translateX(-50%) translateY(0%) scale(1); opacity: 1; }
          58% { transform: translateX(-50%) translateY(6%) scaleY(0.35) scaleX(1.5); opacity: 1; }
          68% { transform: translateX(-50%) translateY(6%) scaleY(0.35) scaleX(1.5); opacity: 0; }
          100% { transform: translateX(-50%) translateY(-160%) scale(1); opacity: 0; }
        }

        @keyframes ink-ripple {
          0%, 52% { transform: translate(-50%, 50%) scale(0.3); opacity: 0; }
          58% { opacity: 0.55; }
          100% { transform: translate(-50%, 50%) scale(3.4); opacity: 0; }
        }

        @keyframes speed-shoot {
          0%, 53% { opacity: 0; height: 4px; }
          57% { opacity: 0.9; height: 22px; }
          72% { opacity: 0; height: 34px; }
          100% { opacity: 0; height: 34px; }
        }

        @keyframes halftone-breathe {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.05); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ink-drop, .ink-ripple, .speed-line, .halftone {
            animation: none;
          }
          .ink-drop { opacity: 1; transform: translateX(-50%) translateY(0%); }
          .ink-ripple, .speed-line { display: none; }
          .halftone { opacity: 0.4; }
        }
      `}</style>
    </div>
  );

  if (!fullScreen) {
    return drop;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-black select-none">
      {drop}

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

      <style jsx>{`
        .brush-underline {
          stroke-dasharray: 140;
          stroke-dashoffset: 140;
          animation: brush-draw 1.8s ease-in-out infinite;
        }
        @keyframes brush-draw {
          0% { stroke-dashoffset: 140; opacity: 0; }
          20% { opacity: 1; }
          55% { stroke-dashoffset: 0; opacity: 1; }
          80%, 100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .brush-underline {
            animation: none;
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export { Loader };
export default Loader;