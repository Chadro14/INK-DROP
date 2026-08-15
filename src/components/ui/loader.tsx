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

export default function Loader({
  fullScreen = true,
  label = "Chargement…",
  size = 22,
  color = "#3B82F6",
}: LoaderProps) {
  const drop = (
    <div 
      className="ink-loader" 
      style={!fullScreen ? { width: size, height: size * 1.6 } : undefined}
      role="status"
      aria-label="Chargement"
    >
      <svg viewBox="0 0 40 64" className="ink-drop" aria-hidden="true">
        <path
          d="M20 2 C20 2 4 26 4 40 C4 51 11 58 20 58 C29 58 36 51 36 40 C36 26 20 2 20 2 Z"
          fill={`url(#inkGradient-${color.replace('#', '')})`}
        />
        <defs>
          <linearGradient id={`inkGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="55%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      <span 
        className="ink-ripple ink-ripple-1" 
        style={{ borderColor: color }}
      />
      <span 
        className="ink-ripple ink-ripple-2" 
        style={{ borderColor: color }}
      />

      <style jsx>{`
        .ink-loader {
          position: relative;
          width: ${fullScreen ? "56px" : `${size}px`};
          height: ${fullScreen ? "88px" : `${size * 1.6}px`};
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ink-drop {
          position: absolute;
          left: 50%;
          bottom: 8%;
          width: 62%;
          height: 62%;
          transform-origin: 50% 100%;
          transform: translateX(-50%);
          animation: ink-fall 1.8s cubic-bezier(0.55, 0, 0.85, 0.35) infinite;
          filter: drop-shadow(0 0 8px ${color}66);
          will-change: transform, opacity;
        }

        .ink-ripple {
          position: absolute;
          left: 50%;
          bottom: 6%;
          width: 40%;
          height: 14%;
          border-radius: 50%;
          border: 1.5px solid ${color};
          transform: translate(-50%, 50%) scale(0.3);
          opacity: 0;
          animation: ink-ripple 1.8s ease-out infinite;
          will-change: transform, opacity;
        }

        .ink-ripple-2 {
          animation-delay: 0.15s;
          border-color: ${color}cc;
        }

        @keyframes ink-fall {
          0% {
            transform: translateX(-50%) translateY(-120%) scale(1);
            opacity: 0;
          }
          14% {
            opacity: 1;
          }
          54% {
            transform: translateX(-50%) translateY(0%) scale(1);
            opacity: 1;
          }
          58% {
            transform: translateX(-50%) translateY(6%) scaleY(0.35) scaleX(1.5);
            opacity: 1;
          }
          68% {
            transform: translateX(-50%) translateY(6%) scaleY(0.35) scaleX(1.5);
            opacity: 0;
          }
          100% {
            transform: translateX(-50%) translateY(-120%) scale(1);
            opacity: 0;
          }
        }

        @keyframes ink-ripple {
          0%,
          52% {
            transform: translate(-50%, 50%) scale(0.3);
            opacity: 0;
          }
          58% {
            opacity: 0.55;
          }
          100% {
            transform: translate(-50%, 50%) scale(2.6);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ink-drop,
          .ink-ripple {
            animation: none;
          }
          .ink-drop {
            opacity: 1;
            transform: translateX(-50%) translateY(0%);
          }
          .ink-ripple {
            display: none;
          }
        }

        /* Mode inline : suppression du fond */
        .ink-loader:not(.fullscreen) {
          background: transparent;
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
        <p className="mt-6 text-zinc-400 text-xs font-medium tracking-[0.15em] uppercase animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}