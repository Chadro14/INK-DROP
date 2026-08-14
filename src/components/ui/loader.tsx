"use client";

import { useEffect, useRef } from "react";

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loader({ 
  message = "Chargement", 
  fullScreen = true 
}: LoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation du cercle de progression
    const circle = document.querySelector('.progress-ring__circle');
    if (circle) {
      const radius = 40;
      const circumference = 2 * Math.PI * radius;
      circle.setAttribute('stroke-dasharray', `${circumference}`);
      circle.setAttribute('stroke-dashoffset', `${circumference}`);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 3 + 1;
        if (progress >= 100) {
          clearInterval(interval);
          progress = 100;
        }
        const offset = circumference - (progress / 100) * circumference;
        circle.setAttribute('stroke-dashoffset', `${offset}`);
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, []);

  const containerClasses = fullScreen
    ? "fixed inset-0 flex flex-col items-center justify-center bg-zinc-950 z-50"
    : "flex flex-col items-center justify-center py-12";

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* ===== ANIMATION SVG ===== */}
      <div className="relative w-32 h-32">
        {/* SVG Principal */}
        <svg
          className="w-full h-full"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cercle de fond */}
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="rgba(59, 130, 246, 0.08)"
            strokeWidth="3"
          />
          
          {/* Cercle de progression */}
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            className="progress-ring__circle"
            transform="rotate(-90 60 60)"
          />
          
          {/* Goutte d'encre - Animation SVG */}
          <g className="ink-drop">
            <path
              d="M60 20 C50 35 40 50 40 65 C40 76 49 85 60 85 C71 85 80 76 80 65 C80 50 70 35 60 20Z"
              fill="url(#inkGradient)"
              className="ink-drop__path"
            >
              <animate
                attributeName="d"
                values="M60 20 C50 35 40 50 40 65 C40 76 49 85 60 85 C71 85 80 76 80 65 C80 50 70 35 60 20Z;M60 15 C47 30 35 50 35 68 C35 82 46 92 60 92 C74 92 85 82 85 68 C85 50 73 30 60 15Z;M60 20 C50 35 40 50 40 65 C40 76 49 85 60 85 C71 85 80 76 80 65 C80 50 70 35 60 20Z"
                dur="2s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
            </path>
            <circle
              cx="60"
              cy="55"
              r="6"
              fill="rgba(255,255,255,0.3)"
              className="ink-drop__highlight"
            >
              <animate
                attributeName="cy"
                values="55;50;55"
                dur="2s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
              <animate
                attributeName="r"
                values="6;8;6"
                dur="2s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
            </circle>
          </g>
          
          {/* Points d'encre */}
          <g className="ink-splashes">
            <circle cx="25" cy="85" r="2" fill="#3B82F6" opacity="0.3">
              <animate
                attributeName="r"
                values="0;3;0"
                dur="3s"
                repeatCount="indefinite"
                begin="0s"
              />
              <animate
                attributeName="opacity"
                values="0;0.6;0"
                dur="3s"
                repeatCount="indefinite"
                begin="0s"
              />
            </circle>
            <circle cx="95" cy="85" r="2" fill="#8B5CF6" opacity="0.3">
              <animate
                attributeName="r"
                values="0;3;0"
                dur="3s"
                repeatCount="indefinite"
                begin="1s"
              />
              <animate
                attributeName="opacity"
                values="0;0.6;0"
                dur="3s"
                repeatCount="indefinite"
                begin="1s"
              />
            </circle>
            <circle cx="30" cy="45" r="2" fill="#3B82F6" opacity="0.2">
              <animate
                attributeName="r"
                values="0;2.5;0"
                dur="3.5s"
                repeatCount="indefinite"
                begin="0.5s"
              />
              <animate
                attributeName="opacity"
                values="0;0.5;0"
                dur="3.5s"
                repeatCount="indefinite"
                begin="0.5s"
              />
            </circle>
            <circle cx="90" cy="45" r="2" fill="#8B5CF6" opacity="0.2">
              <animate
                attributeName="r"
                values="0;2.5;0"
                dur="3.5s"
                repeatCount="indefinite"
                begin="1.5s"
              />
              <animate
                attributeName="opacity"
                values="0;0.5;0"
                dur="3.5s"
                repeatCount="indefinite"
                begin="1.5s"
              />
            </circle>
          </g>
          
          {/* Étoile centrale */}
          <g className="ink-star">
            <path
              d="M60 30 L63 50 L83 50 L67 63 L74 83 L60 70 L46 83 L53 63 L37 50 L57 50 Z"
              fill="url(#starGradient)"
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur="4s"
                repeatCount="indefinite"
                begin="2s"
              />
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 60 55;360 60 55"
                dur="12s"
                repeatCount="indefinite"
              />
            </path>
          </g>
          
          {/* Définitions des dégradés */}
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
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ===== TEXTE ===== */}
      <div className="mt-8 text-center">
        <p className="text-sm font-medium text-zinc-300 animate-pulse">
          {message}
          <span className="inline-block ml-1">
            <span className="animate-bounce inline-block" style={{ animationDelay: "0ms" }}>.</span>
            <span className="animate-bounce inline-block" style={{ animationDelay: "300ms" }}>.</span>
            <span className="animate-bounce inline-block" style={{ animationDelay: "600ms" }}>.</span>
          </span>
        </p>
        <p className="mt-2 text-[10px] text-zinc-600 font-light tracking-[0.15em] uppercase">
          ✦ Préparation de l'encre ✦
        </p>
      </div>
    </div>
  );
}