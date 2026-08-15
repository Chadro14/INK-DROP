"use client";

interface LoaderProps {
  /** Plein écran avec fond noir, ou petit loader inline (dans un bouton, une carte...) */
  fullScreen?: boolean;
  /** Texte affiché sous l'animation (mode plein écran uniquement) */
  label?: string;
  /** Taille du loader compact, en pixels (mode inline uniquement) */
  size?: number;
}

export default function Loader({
  fullScreen = true,
  label = "Chargement…",
  size = 22,
}: LoaderProps) {
  const drop = (
    <div className="ink-loader" style={!fullScreen ? { width: size, height: size * 1.6 } : undefined}>
      <svg viewBox="0 0 40 64" className="ink-drop" aria-hidden="true">
        <path
          d="M20 2 C20 2 4 26 4 40 C4 51 11 58 20 58 C29 58 36 51 36 40 C36 26 20 2 20 2 Z"
          fill="url(#inkGradient)"
        />
        <defs>
          <linearGradient id="inkGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="55%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>

      <span className="ink-ripple ink-ripple-1" />
      <span className="ink-ripple ink-ripple-2" />

      <style jsx>{`
        .ink-loader {
          position: relative;
          width: ${fullScreen ? "56px" : `${size}px`};
          height: ${fullScreen ? "88px" : `${size * 1.6}px`};
          margin: 0 auto;
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
          filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.35));
        }

        .ink-ripple {
          position: absolute;
          left: 50%;
          bottom: 6%;
          width: 40%;
          height: 14%;
          border-radius: 50%;
          border: 1.5px solid #3b82f6;
          transform: translate(-50%, 50%) scale(0.3);
          opacity: 0;
          animation: ink-ripple 1.8s ease-out infinite;
        }

        .ink-ripple-2 {
          animation-delay: 0.15s;
          border-color: #60a5fa;
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
      `}</style>
    </div>
  );

  if (!fullScreen) {
    return drop;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-black">
      {drop}
      {label && (
        <p className="mt-6 text-zinc-400 text-xs font-medium tracking-widest uppercase">
          {label}
        </p>
      )}
    </div>
  );
}