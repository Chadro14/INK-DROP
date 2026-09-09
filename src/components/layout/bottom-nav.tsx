"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, User, Trophy } from "lucide-react";

// 🎬 SVG REEL MODERN
const ReelIcon = ({ className = "w-5 h-5", active = false }: { className?: string; active?: boolean }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.8" />
    <rect x="6" y="2" width="4" height="20" rx="1" fill="currentColor" opacity={active ? "0.8" : "0.4"} />
    <rect x="14" y="2" width="4" height="20" rx="1" fill="currentColor" opacity={active ? "0.8" : "0.4"} />
    <circle cx="12" cy="12" r="4" fill="currentColor" opacity={active ? "0.6" : "0.2"} />
    <circle cx="12" cy="12" r="2" fill="currentColor" opacity={active ? "1" : "0.5"} />
  </svg>
);

interface BottomNavProps {
  primaryColor?: string;
  accentColor?: string;
  theme?: "dark" | "light";
}

export function BottomNav({
  primaryColor = "#3B82F6",
  accentColor = "#8B5CF6",
  theme = "dark",
}: BottomNavProps) {
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const isActive = (path: string) => pathname === path;

  // 🔥 STYLES DYNAMIQUES SELON LE THÈME
  const navBg =
    theme === "dark"
      ? "bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/60"
      : "bg-white/90 backdrop-blur-xl border-t border-gray-200/60 shadow-lg";

  const textMuted = theme === "dark" ? "text-zinc-500" : "text-gray-400";
  const textHover = theme === "dark" ? "hover:text-white" : "hover:text-gray-900";

  const activeStyle = (color: string) => ({
    color: color,
    filter: `drop-shadow(0 0 10px ${color}60)`,
  });

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 ${navBg} px-4 py-2 transition-all duration-300`}>
      <div className="flex items-center justify-around max-w-lg mx-auto">

        {/* ACCUEIL */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            isActive("/") ? "text-blue-500" : `${textMuted} ${textHover}`
          }`}
          style={isActive("/") ? activeStyle(primaryColor) : {}}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>

        {/* DÉCOUVRIR */}
        <Link
          href="/discover"
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            isActive("/discover") ? "text-blue-500" : `${textMuted} ${textHover}`
          }`}
          style={isActive("/discover") ? activeStyle(primaryColor) : {}}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Découvrir</span>
        </Link>

        {/* REELS — AVEC NOUVEAU SVG */}
        <Link
          href="/reels"
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            isActive("/reels") || pathname?.startsWith("/reels/")
              ? "text-purple-400"
              : `${textMuted} ${textHover}`
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

        {/* ÉVÉNEMENTS */}
        <Link
          href="/events"
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            isActive("/events") || pathname?.startsWith("/events/")
              ? "text-amber-400"
              : `${textMuted} ${textHover}`
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

        {/* PROFIL */}
        <Link
          href={token ? "/profile" : "/login"}
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            isActive("/profile") ? "text-blue-500" : `${textMuted} ${textHover}`
          }`}
          style={isActive("/profile") ? activeStyle(primaryColor) : {}}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>

      </div>
    </nav>
  );
}
