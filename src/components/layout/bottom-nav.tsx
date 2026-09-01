// components/layout/bottom-nav.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Compass, User, Trophy } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/60 px-4 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/") ? "text-blue-500" : "text-zinc-500 hover:text-white"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>

        <Link
          href="/discover"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/discover") ? "text-blue-500" : "text-zinc-500 hover:text-white"
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Découvrir</span>
        </Link>

        <Link
          href="/creator/upload"
          className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 -mt-4">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-medium">Publier</span>
        </Link>

        {/* ✅ ÉVÉNEMENTS - NOUVEAU */}
        <Link
          href="/events"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/events") || pathname?.startsWith("/events/")
              ? "text-amber-400"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-medium">Événements</span>
        </Link>

        <Link
          href={token ? "/profile" : "/login"}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/profile") ? "text-blue-500" : "text-zinc-500 hover:text-white"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </div>
    </nav>
  );
}
