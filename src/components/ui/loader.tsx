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
  const clipB = `clipPanelB-${color.replace("#", "")}`;
  const clipC = `clipPanelC-${color.replace("#", "")}`;

  // ===== MODE COMPACT : simple goutte + ondes, pour les boutons =====
  if (!fullScreen) {
    return (
      <div
        className="ink-compact"
        style={{ width: size, height: size * 1.6 }}
        role="status"
        aria-label="Chargement"
      >
        <svg viewBox="0 0 40 64" className="c-drop" aria-hidden="true">
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
        <span className="c-ripple" style={{ borderColor: color }} />
        <style jsx>{`
          .ink-compact { position: relative; margin: 0 auto; }
          .c-drop {
            position: absolute; left: 50%; bottom: 8%; width: 62%; height: 62%;
            transform: translateX(-50%);
            animation: c-fall 1.4s cubic-bezier(0.55,0,0.85,0.35) infinite;
          }
          .c-ripple {
            position: absolute; left: 50%; bottom: 6%; width: 40%; height: 14%;
            border-radius: 50%; border: 1.5px solid ${color};
            transform: translate(-50%, 50%) scale(0.3); opacity: 0;
            animation: c-ripple 1.4s ease-out infinite;
          }
          @keyframes c-fall {
            0% { transform: translateX(-50%) translateY(-140%); opacity: 0; }
            15% { opacity: 1; }
            60% { transform: translateX(-50%) translateY(0%) scaleY(1); opacity: 1; }
            65% { transform: translateX(-50%) translateY(4%) scaleY(0.4) scaleX(1.5); opacity: 0; }
            100% { transform: translateX(-50%) translateY(-140%); opacity: 0; }
          }
          @keyframes c-ripple {
            0%, 58% { transform: translate(-50%, 50%) scale(0.3); opacity: 0; }
            64% { opacity: 0.5; }
            100% { transform: translate(-50%, 50%) scale(2.8); opacity: 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            .c-drop, .c-ripple { animation: none; }
            .c-drop { opacity: 1; transform: translateX(-50%); }
            .c-ripple { display: none; }
          }
        `}</style>
      </div>
    );
  }

  // ===== MODE PLEIN ÉCRAN : la planche de manga qui se dessine =====
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-black select-none">
      <div className="page-wrap" role="status" aria-label="Chargement">
        <svg viewBox="0 0 120 160" className="page-svg" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.85" />
              <stop offset="55%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </linearGradient>
            <clipPath id={clipB}>
              <rect x="12" y="96" width="44" height="60" rx="1" />
            </clipPath>
            <clipPath id={clipC}>
              <rect x="64" y="96" width="44" height="60" rx="1" />
            </clipPath>
          </defs>

          <g className="composition">
            {/* Contour de la page */}
            <rect
              className="stroke page-border"
              x="4" y="4" width="112" height="152" rx="3"
            />

            {/* Case A — grande case du haut : la goutte y tombe */}
            <rect className="stroke panel-a" x="12" y="12" width="96" height="76" />

            {/* Case B — bas gauche : trame de demi-teintes */}
            <rect className="stroke panel-b" x="12" y="96" width="44" height="60" />
            <g clipPath={`url(#${clipB})`}>
              <g className="halftone-dots">
                {Array.from({ length: 48 }, (_, i) => {
                  const col = i % 8;
                  const row = Math.floor(i / 8);
                  return (
                    <circle
                      key={i}
                      cx={16 + col * 5.5}
                      cy={100 + row * 8}
                      r="1.1"
                      fill={color}
                    />
                  );
                })}
              </g>
            </g>

            {/* Case C — bas droite : hachures d'ombre */}
            <rect className="stroke panel-c" x="64" y="96" width="44" height="60" />
            <g clipPath={`url(#${clipC})`} className="hatch-group">
              {Array.from({ length: 9 }, (_, i) => (
                <line
                  key={i}
                  className="hatch-line"
                  x1={64 + i * 7 - 20}
                  y1="96"
                  x2={64 + i * 7 + 20}
                  y2="156"
                  stroke={color}
                  strokeWidth="1"
                  style={{ animationDelay: `${i * 0.02}s` }}
                />
              ))}
            </g>

            {/* La goutte, sa chute et son impact — au cœur de la case A */}
            <g className="drop-scene">
              <path
                className="ink-drop"
                d="M60 30 C60 30 51 44 51 52 C51 58.5 55 62.5 60 62.5 C65 62.5 69 58.5 69 52 C69 44 60 30 60 30 Z"
                fill={`url(#${gradientId})`}
              />
              <ellipse className="ripple ripple-1" cx="60" cy="80" rx="8" ry="3" style={{ stroke: color }} />
              <ellipse className="ripple ripple-2" cx="60" cy="80" rx="8" ry="3" style={{ stroke: color }} />
              <g className="speed-burst">
                {Array.from({ length: 8 }, (_, i) => {
                  const angle = (360 / 8) * i;
                  return (
                    <line
                      key={i}
                      className="speed-line"
                      x1="60" y1="80" x2="60" y2="80"
                      stroke={color}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      style={{ transform: `rotate(${angle}deg)`, transformOrigin: "60px 80px" }}
                    />
                  );
                })}
              </g>
            </g>
          </g>
        </svg>

        <style jsx>{`
          .page-wrap { width: 140px; }
          .page-svg { width: 100%; height: auto; overflow: visible; }

          .composition {
            animation: comp-fade 4.4s ease-in-out infinite;
          }

          .stroke {
            fill: none;
            stroke: ${color};
            stroke-width: 1.6;
            stroke-linejoin: round;
          }

          .page-border {
            stroke-dasharray: 530;
            stroke-dashoffset: 530;
            animation: draw 4.4s linear infinite;
            animation-delay: 0s;
          }
          .panel-a {
            stroke-dasharray: 346;
            stroke-dashoffset: 346;
            animation: draw-a 4.4s linear infinite;
          }
          .panel-b {
            stroke-dasharray: 210;
            stroke-dashoffset: 210;
            animation: draw-b 4.4s linear infinite;
          }
          .panel-c {
            stroke-dasharray: 210;
            stroke-dashoffset: 210;
            animation: draw-c 4.4s linear infinite;
          }

          .halftone-dots {
            opacity: 0;
            animation: fade-in-slow 4.4s ease-in-out infinite;
          }

          .hatch-line {
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            opacity: 0;
            animation: hatch-draw 4.4s ease-in-out infinite;
          }

          .ink-drop {
            transform-box: fill-box;
            transform-origin: 50% 0%;
            opacity: 0;
            animation: ink-fall 4.4s cubic-bezier(0.5, 0, 0.75, 0.3) infinite;
          }

          .ripple {
            fill: none;
            stroke-width: 1;
            transform-box: fill-box;
            transform-origin: center;
            opacity: 0;
            animation: ink-ripple 4.4s ease-out infinite;
          }
          .ripple-2 { animation-delay: 0.08s; }

          .speed-line {
            opacity: 0;
            animation: speed-shoot 4.4s ease-out infinite;
          }

          @keyframes comp-fade {
            0%   { opacity: 0; }
            4%   { opacity: 1; }
            58%  { opacity: 1; }
            68%  { opacity: 0; }
            100% { opacity: 0; }
          }

          @keyframes draw {
            0% { stroke-dashoffset: 530; }
            8% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes draw-a {
            0%, 8% { stroke-dashoffset: 346; }
            18% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes draw-b {
            0%, 18% { stroke-dashoffset: 210; }
            26% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes draw-c {
            0%, 20% { stroke-dashoffset: 210; }
            28% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 0; }
          }

          @keyframes fade-in-slow {
            0%, 30% { opacity: 0; }
            46% { opacity: 0.85; }
            100% { opacity: 0.85; }
          }

          @keyframes hatch-draw {
            0%, 26% { stroke-dashoffset: 48; opacity: 0; }
            36% { stroke-dashoffset: 0; opacity: 0.55; }
            100% { stroke-dashoffset: 0; opacity: 0.55; }
          }

          @keyframes ink-fall {
            0%, 26%  { transform: translateY(-38px); opacity: 0; }
            32%      { opacity: 1; }
            50%      { transform: translateY(0px) scaleY(1); opacity: 1; }
            53%      { transform: translateY(2px) scaleY(0.35) scaleX(1.6); opacity: 1; }
            57%      { transform: translateY(2px) scaleY(0.35) scaleX(1.6); opacity: 0; }
            100%     { transform: translateY(-38px); opacity: 0; }
          }

          @keyframes ink-ripple {
            0%, 50%  { transform: scale(0.3); opacity: 0; }
            56%      { opacity: 0.6; }
            72%      { transform: scale(2.4); opacity: 0; }
            100%     { transform: scale(2.4); opacity: 0; }
          }

          @keyframes speed-shoot {
            0%, 51%  { opacity: 0; transform: rotate(var(--r, 0deg)) translateX(0); }
            54%      { opacity: 1; transform: rotate(var(--r, 0deg)) translateX(4px); }
            62%      { opacity: 0; transform: rotate(var(--r, 0deg)) translateX(11px); }
            100%     { opacity: 0; transform: rotate(var(--r, 0deg)) translateX(11px); }
          }

          @media (prefers-reduced-motion: reduce) {
            .composition, .page-border, .panel-a, .panel-b, .panel-c,
            .halftone-dots, .hatch-line, .ink-drop, .ripple, .speed-line {
              animation: none;
            }
            .composition { opacity: 1; }
            .page-border, .panel-a, .panel-b, .panel-c { stroke-dashoffset: 0; }
            .halftone-dots { opacity: 0.7; }
            .hatch-line { stroke-dashoffset: 0; opacity: 0.4; }
            .ink-drop { opacity: 1; transform: translateY(0); }
            .ripple, .speed-line { display: none; }
          }
        `}</style>
      </div>

      {label && (
        <div className="mt-6 flex flex-col items-center">
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
          animation: brush-draw 4.4s ease-in-out infinite;
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