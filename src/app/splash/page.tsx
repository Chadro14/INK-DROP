"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animation de chargement
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 15 + 5;
        return next >= 100 ? 100 : next;
      });
    }, 200);

    // Redirection après 2.8 secondes
    const timer = setTimeout(() => {
      router.push("/");
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white selection:bg-blue-500 selection:text-white overflow-hidden">
      
      {/* Halo lumineux d'arrière-plan */}
      <div className="absolute w-[350px] h-[350px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* BLOC LOGO ET NOM */}
      <div className="relative z-10 flex flex-col items-center mb-10 animate-fade-in">
        {/* Logo SVG avec effet néon */}
        <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10 mb-4">
          <svg
            className="w-20 h-20 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <path d="M8 8h8v8H8z" />
            <circle cx="12" cy="12" r="2" className="fill-blue-500" />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="text-4xl font-extrabold tracking-tight text-center">
          INK<span className="text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]">DROP</span>
        </h1>
      </div>

      {/* BARRE DE CHARGEMENT BLEU ÉLECTRIQUE */}
      <div className="relative z-10 w-52 h-1.5 bg-zinc-900 border border-zinc-800/60 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(37,99,235,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* SOUSTITRE ANIMÉ */}
      <p className="relative z-10 text-xs font-medium text-zinc-500 mt-4 tracking-wider uppercase animate-pulse">
        Chargement...
      </p>
    </div>
  );
}
