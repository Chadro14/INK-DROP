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

    // Redirection après 2.5 secondes
    const timer = setTimeout(() => {
      router.push("/");
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">

      {/* LOGO */}
      <div className="mb-8 animate-fade-in">
        <svg className="w-24 h-24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="4" />
          <path d="M8 8h8v8H8z" />
          <circle cx="12" cy="12" r="2" />
        </svg>
        <h1 className="text-4xl font-bold text-center mt-4 text-black">
          INK<span className="text-black">DROP</span>
        </h1>
      </div>

      {/* BARRE DE CHARGEMENT (style TikTok) */}
      <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden mt-8">
        <div
          className="h-full bg-black rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-gray-400 mt-4 animate-pulse-glow">
        Chargement...
      </p>
    </div>
  );
}