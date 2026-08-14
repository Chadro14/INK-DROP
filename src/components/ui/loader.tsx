"use client";

import { useEffect, useRef, useState } from "react";

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

export function Loader({ 
  message = "Chargement de l'encre",
  fullScreen = true,
  onComplete
}: LoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"drop" | "spread" | "pulse" | "complete">("drop");
  const [displayText, setDisplayText] = useState("");
  const fullText = message || "Chargement de l'encre";
  const [textIndex, setTextIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // ============================================
  // PARTICLES SYSTEM
  // ============================================
  useEffect(() => {
    const colors = ["#3B82F6", "#8B5CF6", "#60A5FA", "#A78BFA", "#2563EB", "#7C3AED"];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        x: Math.random() * 120,
        y: Math.random() * 120,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2 - 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles(newParticles);

    // Animation des particules
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.speedX,
        y: p.y + p.speedY,
        opacity: p.opacity + (Math.random() - 0.5) * 0.05,
        size: p.size + (Math.random() - 0.5) * 0.5,
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // ============================================
  // PROGRESSION
  // ============================================
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 2 + 0.5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setPhase("complete");
          if (onComplete) setTimeout(onComplete, 500);
          return 100;
        }
        
        if (newProgress > 30 && phase === "drop") setPhase("spread");
        if (newProgress > 70 && phase === "spread") setPhase("pulse");
        
        return newProgress;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [phase, onComplete]);

  // ============================================
  // MACHINE À ÉCRIRE
  // ============================================
  useEffect(() => {
    if (textIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + fullText[textIndex]);
        setTextIndex(prev => prev + 1);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [textIndex, fullText]);

  // ============================================
  // CURSEUR CLIGNOTANT
  // ============================================
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // ============================================
  // CALCUL DES DÉGAGÉS POUR LE CERCLE
  // ============================================
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const containerClasses = fullScreen
    ? "fixed inset-0 flex flex-col items-center justify-center bg-zinc-950 z-50 overflow-hidden"
    : "flex flex-col items-center justify-center py-12";

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* ===== FOND ANIMÉ ===== */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Onde de fond */}
        <div className="absolute -inset-[100px] bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5">
          <div 
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.1) 0%, transparent 70%)",
              animation: "pulse 4s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* ===== SVG PRINCIPAL ===== */}
      <div className="relative w-48 h-48 md:w-56 md:h-56">
        <svg
          className="w-full h-full"
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ===== PARTICULES ===== */}
          {particles.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.size}
              fill={p.color}
              opacity={p.opacity}
            >
              <animate
                attributeName="cx"
                values={`${p.x};${p.x + p.speedX * 10};${p.x}`}
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${p.y};${p.y + p.speedY * 10};${p.y}`}
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          ))}

          {/* ===== CERCLE DE FOND ===== */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="rgba(59, 130, 246, 0.08)"
            strokeWidth="4"
            className="animate-spin-slow"
          />

          {/* ===== CERCLE DE PROGRESSION ===== */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            className="transition-all duration-200"
          >
            <animate
              attributeName="stroke-dashoffset"
              values={`${circumference};${offset}`}
              dur="0.3s"
              fill="freeze"
            />
          </circle>

          {/* ===== GOUTTE D'ENCRE ===== */}
          <g className="ink-drop">
            <path
              d="M70 25 C55 45 45 60 45 75 C45 89 56 100 70 100 C84 100 95 89 95 75 C95 60 85 45 70 25Z"
              fill="url(#inkGradient)"
              className="ink-drop__path"
            >
              <animate
                attributeName="d"
                values="M70 25 C55 45 45 60 45 75 C45 89 56 100 70 100 C84 100 95 89 95 75 C95 60 85 45 70 25Z;M70 20 C50 40 38 60 38 78 C38 95 52 108 70 108 C88 108 102 95 102 78 C102 60 90 40 70 20Z;M70 25 C55 45 45 60 45 75 C45 89 56 100 70 100 C84 100 95 89 95 75 C95 60 85 45 70 25Z"
                dur="3s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
            </path>

            {/* Reflet sur la goutte */}
            <ellipse
              cx="65"
              cy="65"
              rx="10"
              ry="14"
              fill="rgba(255,255,255,0.15)"
              className="ink-drop__highlight"
            >
              <animate
                attributeName="cy"
                values="65;58;65"
                dur="3s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
            </ellipse>

            {/* Petit point lumineux */}
            <circle cx="62" cy="55" r="3" fill="rgba(255,255,255,0.2)">
              <animate
                attributeName="cy"
                values="55;50;55"
                dur="3s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
            </circle>
          </g>

          {/* ===== SPLASH (éclaboussures) ===== */}
          <g className="ink-splashes">
            <circle cx="25" cy="95" r="3" fill="#3B82F6" opacity="0">
              <animate
                attributeName="r"
                values="0;6;0"
                dur="2.5s"
                repeatCount="indefinite"
                begin="0s"
              />
              <animate
                attributeName="opacity"
                values="0;0.5;0"
                dur="2.5s"
                repeatCount="indefinite"
                begin="0s"
              />
            </circle>
            <circle cx="115" cy="95" r="3" fill="#8B5CF6" opacity="0">
              <animate
                attributeName="r"
                values="0;5;0"
                dur="2.8s"
                repeatCount="indefinite"
                begin="0.5s"
              />
              <animate
                attributeName="opacity"
                values="0;0.4;0"
                dur="2.8s"
                repeatCount="indefinite"
                begin="0.5s"
              />
            </circle>
            <circle cx="35" cy="50" r="2" fill="#60A5FA" opacity="0">
              <animate
                attributeName="r"
                values="0;4;0"
                dur="3s"
                repeatCount="indefinite"
                begin="1s"
              />
              <animate
                attributeName="opacity"
                values="0;0.3;0"
                dur="3s"
                repeatCount="indefinite"
                begin="1s"
              />
            </circle>
            <circle cx="105" cy="50" r="2" fill="#A78BFA" opacity="0">
              <animate
                attributeName="r"
                values="0;4;0"
                dur="3.2s"
                repeatCount="indefinite"
                begin="1.5s"
              />
              <animate
                attributeName="opacity"
                values="0;0.3;0"
                dur="3.2s"
                repeatCount="indefinite"
                begin="1.5s"
              />
            </circle>
          </g>

          {/* ===== ÉTOILE CENTRALE ===== */}
          <g className="ink-star">
            <path
              d="M70 45 L74 61 L90 61 L78 72 L82 88 L70 77 L58 88 L62 72 L50 61 L66 61 Z"
              fill="url(#starGradient)"
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur="5s"
                repeatCount="indefinite"
                begin="3s"
              />
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 70 70;360 70 70"
                dur="15s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          {/* ===== VAGUE D'ENCRE ===== */}
          <g className="ink-wave" opacity="0.15">
            <path
              d="M20 110 Q50 100 70 110 Q90 100 120 110"
              stroke="#3B82F6"
              strokeWidth="2"
              fill="none"
            >
              <animate
                attributeName="d"
                values="M20 110 Q50 100 70 110 Q90 100 120 110;M20 110 Q50 120 70 110 Q90 100 120 110;M20 110 Q50 100 70 110 Q90 100 120 110"
                dur="3s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
            </path>
            <path
              d="M20 118 Q50 108 70 118 Q90 108 120 118"
              stroke="#8B5CF6"
              strokeWidth="1.5"
              fill="none"
            >
              <animate
                attributeName="d"
                values="M20 118 Q50 128 70 118 Q90 108 120 118;M20 118 Q50 108 70 118 Q90 128 120 118;M20 118 Q50 128 70 118 Q90 108 120 118"
                dur="3.5s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
            </path>
          </g>

          {/* ===== DÉFINITIONS ===== */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
              <animateTransform
                attributeName="gradientTransform"
                type="rotate"
                from="0 0.5 0.5"
                to="360 0.5 0.5"
                dur="4s"
                repeatCount="indefinite"
              />
            </linearGradient>
            <linearGradient id="inkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6">
                <animate
                  attributeName="stop-color"
                  values="#3B82F6;#8B5CF6;#3B82F6"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#1E40AF">
                <animate
                  attributeName="stop-color"
                  values="#1E40AF;#6D28D9;#1E40AF"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#F59E0B" />
              <animate
                attributeName="gradientTransform"
                type="rotate"
                from="0 0.5 0.5"
                to="360 0.5 0.5"
                dur="8s"
                repeatCount="indefinite"
              />
            </linearGradient>
            <radialGradient id="glow">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* ===== LUEUR NÉON ===== */}
        <div 
          className="absolute inset-0 rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle at 50% 50%, #3B82F6, transparent 70%)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* ===== TEXTE AVEC EFFET MACHINE À ÉCRIRE ===== */}
      <div className="mt-10 text-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-sm md:text-base font-light text-zinc-300 tracking-[0.05em]">
            {displayText}
            <span 
              className={`inline-block w-0.5 h-4 bg-blue-400 ml-0.5 transition-opacity duration-100 ${
                showCursor ? "opacity-100" : "opacity-0"
              }`}
            />
          </p>
        </div>
        
        {/* Sous-texte animé */}
        <div className="mt-3 overflow-hidden">
          <p className="text-[10px] md:text-xs text-zinc-500 font-light tracking-[0.15em] uppercase animate-slide-up">
            {progress >= 100 
              ? "✦ Prêt à créer ✦" 
              : phase === "drop" 
              ? "💧 L'encre coule..." 
              : phase === "spread" 
              ? "🌊 L'encre s'étale..." 
              : "✨ L'encre vit..."}
          </p>
        </div>

        {/* Pourcentage */}
        <div className="mt-4">
          <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {Math.round(progress)}%
          </p>
        </div>
      </div>

      {/* ===== STYLES CSS ===== */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}