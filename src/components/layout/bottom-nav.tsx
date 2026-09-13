"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, User, Trophy } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";
const LAST_SEEN_KEY = "inkdrop_events_last_seen";

// ============================================
// CACHE MÉMOIRE (évite les fetchs redondants)
// ============================================
let eventsCache: { data: any[]; at: number } | null = null;
const CACHE_TTL_MS = 30_000;

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
  const [token, setToken] = useState<string | null>(null);
  const [activeEventsCount, setActiveEventsCount] = useState(0);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  // ============================================
  // COMPTE DES NOUVEAUX ÉVÉNEMENTS (depuis lastSeen)
  // ============================================
  useEffect(() => {
    const fetchNewEvents = async () => {
      try {
        let events: any[] | null = null;

        // Cache valide ?
        if (eventsCache && Date.now() - eventsCache.at < CACHE_TTL_MS) {
          events = eventsCache.data;
        } else {
          const token = localStorage.getItem("token");
          const headers: HeadersInit = token
            ? { Authorization: `Bearer ${token}` }
            : {};

          const res = await fetch(`${API_URL}/events?isActive=true`, {
            headers,
          });
          if (!res.ok) return;

          const data = await res.json();
          const list = data.data || data || [];
          events = Array.isArray(list) ? list : [];
          eventsCache = { data: events, at: Date.now() };
        }

        if (!events) return;

        // Dernière visite de l'onglet Événements
        const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
        const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;

        // Compter les événements créés après lastSeen
        const newCount = events.filter((e) => {
          if (!e.createdAt) return true;
          return new Date(e.createdAt).getTime() > lastSeenTime;
        }).length;

        setActiveEventsCount(newCount);
      } catch (err) {
        console.error("Erreur comptage événements:", err);
      }
    };

    fetchNewEvents();
  }, [pathname]);

  // ============================================
  // MARQUER COMME VU quand on est sur /events
  // ============================================
  useEffect(() => {
    if (pathname === "/events" || pathname?.startsWith("/events/")) {
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
      setActiveEventsCount(0);
    }
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  const activeStyle = (color: string) => ({
    color: color,
    filter: `drop-shadow(0 0 10px ${color}60)`,
  });

  const eventsIsActive =
    isActive("/events") || pathname?.startsWith("/events/");

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
            isActive("/discover")
              ? ""
              : "text-muted-foreground hover:text-foreground"
          }`}
          style={isActive("/discover") ? activeStyle(primaryColor) : {}}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Découvrir</span>
        </Link>

        {/* ===== REELS ===== */}
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
          className={`relative flex flex-col items-center gap-1 transition-all duration-200 ${
            eventsIsActive ? "" : "text-muted-foreground hover:text-foreground"
          }`}
          style={eventsIsActive ? activeStyle("#F59E0B") : {}}
        >
          <div className="relative">
            <Trophy className="w-5 h-5" />

            {activeEventsCount > 0 && !eventsIsActive && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md border border-background">
                {activeEventsCount > 9 ? "9+" : activeEventsCount}
              </span>
            )}
          </div>
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
