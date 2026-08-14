// src/components/ui/loader.tsx
"use client";

import { useState, useEffect } from "react";

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loader({ 
  message = "Chargement de l'encre...", 
  fullScreen = true 
}: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"ink" | "spread" | "ready">("ink");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase("ready");
          return 100;
        }
        
        if (prev < 40) setPhase("ink");
        else if (prev < 80) setPhase("spread");
        
        return prev + Math.random() * 6;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const containerClasses = fullScreen
    ? "flex flex-col items-center justify-center h-screen bg-zinc-950 text-white"
    : "flex flex-col items-center justify-center py-12 text-white";

  const phaseMessages = {
    ink: "L'encre coule...",
    spread: "L'encre s'étale...",
    ready: "Prêt à créer !",
  };

  const phaseEmojis = {
    ink: "💧",
    spread: "🌊",
    ready: "✨",
  };

  return (
    <div className={containerClasses}>
      {/* Animation d'encre */}
      <div className="relative w-24 h-24 mb-6">
        <div 
          className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping"
          style={{ animationDuration: "1.5s" }}
        />
        <div 
          className="absolute inset-2 rounded-full bg-blue-500/20 animate-pulse"
          style={{ animationDuration: "2s" }}
        />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">
          {phaseEmojis[phase]}
        </div>
      </div>

      <p className="text-sm font-medium text-zinc-300 animate-pulse">
        {phaseMessages[phase]}
      </p>

      <div className="w-64 max-w-full mt-4">
        <div className="flex justify-between text-xs text-zinc-500 mb-1">
          <span>{message}</span>
          <span>{Math.min(Math.round(progress), 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full transition-all duration-200"
            style={{ 
              width: `${Math.min(progress, 100)}%`,
              boxShadow: "0 0 12px rgba(59, 130, 246, 0.3)"
            }}
          />
        </div>
      </div>

      <p className="mt-6 text-[10px] text-zinc-600 font-light tracking-[0.2em] uppercase transition-all duration-500">
        {progress >= 100 ? "✦ Prêt à créer ✦" : "✦ L'encre coule... ✦"}
      </p>

      <div className="flex gap-2 mt-3 opacity-50">
        <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
        <div className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: "300ms" }} />
        <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "600ms" }} />
        <div className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: "900ms" }} />
      </div>
    </div>
  );
}
