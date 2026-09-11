"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, User, Trophy } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

// ============================================
// 🎬 SVG REELS — STYLE INSTAGRAM
// ============================================
const ReelIcon = ({
  className = "w-5 h-5",
  active = false,
}: {
  className?: string;
  active?: boolean;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Carré avec coins arrondis */}
    <rect
      x="2.5"
      y="2.5"
      width="19"
      height="19"
      rx="4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? "0.12" : "0"}
    />

    {/* Triangle de lecture (play) */}
    <polygon
      points="9.5,7.5 16.5,12 9.5,16.5"
      fill="currentColor"
      opacity={active ? "1" : "0.7"}
    />
  </svg>
);

interface BottomNavProps {
  primaryColor?: string;
  accentColor?: string;
}

export function BottomNav({
  primaryColor = "#3B82F6",
  accentColor = "#8B5CF6",
}: BottomNavProps) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const isActive = (path: string) => pathname === path;

  // ============================================
  // STYLE ACTIF avec couleur personnalisée
  // ============================================
  const activeStyle = (color: string) => ({
    color: color,
    filter: `drop-shadow(0 0 10px ${color}60)`,
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/60 px-4 py-2 transition-all duration-300">
      <div className="flex items-center justify-around max-w-lg mx-auto">

        {/* ===== ACCUEIL ===== */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            isActive("/") ? "" : "text-muted-foreground hover:text-foreground"
          }`}
          style={isActive("/") ? activeStyle(primaryColor) : {}}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>

        {/* ===== DÉCOUVRIR ===== */}
        <Link
          href="/discover"
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            isActive("/discover") ? "" : "text-muted-foreground hover:text-foreground"
          }`}
          style={isActive("/discover") ? activeStyle(primaryColor) : {}}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Découvrir</span>
        </Link>

        {/* ===== REELS — STYLE INSTAGRAM ===== */}
        <Link
          href="/reels"
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            isActive("/reels") || pathname?.startsWith("/reels/")
              ? ""
              : "text-muted-foreground hover:text-foreground"
          }`}
          style={
            isActive("/reels") || pathname?.startsWith("/reels/")
              ? activeStyle(accentColor)
              : {}
          }
        >
          <ReelIcon
            className="w-5 h-5"
            active={isActive("/reels") || pathname?.startsWith("/reels/")}
          />
          <span className="text-[10px] font-medium">Reels</span>
        </Link>

        {/* ===== ÉVÉNEMENTS ===== */}
        <Link
          href="/events"
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            isActive("/events") || pathname?.startsWith("/events/")
              ? ""
              : "text-muted-foreground hover:text-foreground"
          }`}
          style={
            isActive("/events") || pathname?.startsWith("/events/")
              ? activeStyle("#F59E0B")
              : {}
          }
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-medium">Événements</span>
        </Link>

        {/* ===== PROFIL ===== */}
        <Link
          href={token ? "/profile" : "/login"}
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            isActive("/profile") || pathname?.startsWith("/profile/")
              ? ""
              : "text-muted-foreground hover:text-foreground"
          }`}
          style={
            isActive("/profile") || pathname?.startsWith("/profile/")
              ? activeStyle(primaryColor)
              : {}
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>

      </div>
    </nav>
  );
}
