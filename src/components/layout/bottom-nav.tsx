"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Film, User, Trophy } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/60 px-4 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        
        {/* ACCUEIL */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/") ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>

        {/* DÉCOUVRIR */}
        <Link
          href="/discover"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/discover") ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Découvrir</span>
        </Link>

        {/* REELS (remplace Publier) */}
        <Link
          href="/reels"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/reels") || pathname?.startsWith("/reels/")
              ? "text-purple-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Film className="w-5 h-5" />
          <span className="text-[10px] font-medium">Reels</span>
        </Link>

        {/* ÉVÉNEMENTS */}
        <Link
          href="/events"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/events") || pathname?.startsWith("/events/")
              ? "text-amber-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-medium">Événements</span>
        </Link>

        {/* PROFIL */}
        <Link
          href={token ? "/profile" : "/login"}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/profile") ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>

      </div>
    </nav>
  );
}
