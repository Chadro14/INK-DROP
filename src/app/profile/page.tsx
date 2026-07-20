"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  User, 
  BookOpen, 
  Users, 
  Heart, 
  Settings, 
  LogOut,
  Star,
  Edit,
  Eye
} from "lucide-react";

// ============================================
// TYPES
// ============================================
type UserProfile = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  isCertified: boolean;
  premiumActive: boolean;
  createdAt: string;
  _count: {
    mangas: number;
    followers: number;
    following: number;
  };
};

type Manga = {
  id: string;
  title: string;
  coverUrl: string;
  genre: string[];
  likesCount: number;
  viewsCount: number;
};

// ============================================
// COMPOSANTS SVG
// ============================================
const IconManga = () => (
  <svg className="w-8 h-8 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="7" y1="7" x2="17" y2="7" />
    <line x1="7" y1="11" x2="17" y2="11" />
    <line x1="7" y1="15" x2="13" y2="15" />
  </svg>
);

// ============================================
// PAGE
// ============================================
export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  // ============================================
  // FETCH PROFIL
  // ============================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Non authentifié");
        }

        const data = await res.json();
        setProfile(data);
        setMangas(data.mangas || []);
      } catch (error) {
        console.error("Erreur:", error);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ============================================
  // DÉCONNEXION
  // ============================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-ink-bg">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-ink-bg">
        <p className="text-ink-muted">Utilisateur non trouvé</p>
        <Link href="/login" className="mt-4 px-6 py-2 rounded-lg bg-accent text-white font-semibold">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-ink-bg">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-ink-bg/80 backdrop-blur-sm border-b border-ink-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="text-lg font-bold text-white">Profil</span>
          <div className="flex items-center gap-3">
            <button className="text-ink-muted hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="text-ink-muted hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ===== AVATAR & NOM ===== */}
      <section className="px-4 py-6 text-center border-b border-ink-border">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-accent-dark/20 flex items-center justify-center text-3xl font-bold text-white mx-auto border-2 border-accent">
            {profile.username?.charAt(0).toUpperCase() || "?"}
          </div>
          {profile.isCertified && (
            <span className="absolute -top-1 -right-1">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            </span>
          )}
          {profile.premiumActive && (
            <span className="absolute -bottom-1 -right-1 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              PREMIUM
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-white mt-3">{profile.username}</h1>
        <p className="text-ink-muted text-sm">{profile.bio || "Aucune bio"}</p>

        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div>
            <span className="text-white font-bold">{profile._count?.mangas || 0}</span>
            <span className="text-ink-muted ml-1">mangas</span>
          </div>
          <div>
            <span className="text-white font-bold">{profile._count?.followers || 0}</span>
            <span className="text-ink-muted ml-1">abonnés</span>
          </div>
          <div>
            <span className="text-white font-bold">{profile._count?.following || 0}</span>
            <span className="text-ink-muted ml-1">abonnements</span>
          </div>
        </div>

        <button className="mt-4 px-6 py-2 rounded-lg bg-accent/10 text-accent text-sm font-semibold hover:bg-accent/20 transition-colors flex items-center gap-2 mx-auto">
          <Edit className="w-4 h-4" />
          Modifier le profil
        </button>
      </section>

      {/* ===== MANGAS PUBLIÉS ===== */}
      <section className="flex-1 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-ink-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-accent" />
            Mangas publiés
          </h2>
          <Link href="/creator/upload" className="text-accent text-xs font-medium hover:underline">
            + Ajouter
          </Link>
        </div>

        {mangas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <IconManga />
            <p className="text-ink-muted mt-4 text-sm">Aucun manga publié</p>
            <Link
              href="/creator/upload"
              className="mt-4 px-6 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              Publier mon premier manga
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {mangas.map((manga) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className="bg-ink-card border border-ink-border rounded-xl overflow-hidden hover:border-accent transition-all active:scale-[0.97]"
              >
                <div className="aspect-[2/3] bg-gradient-to-br from-accent/20 to-accent-dark/20 flex items-center justify-center relative">
                  <IconManga />
                  <div className="absolute top-2 left-2 flex gap-1">
                    {manga.genre?.slice(0, 2).map((g: string) => (
                      <span key={g} className="text-[8px] font-medium px-1.5 py-0.5 rounded bg-black/50 text-white backdrop-blur-sm">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-semibold truncate text-white">{manga.title}</h3>
                  <div className="flex items-center gap-3 mt-0.5 text-ink-muted text-[10px]">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3 text-accent" /> {manga.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3 text-accent" /> {manga.viewsCount || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== BOTTOM NAVIGATION ===== */}
      <BottomNav />

    </div>
  );
}