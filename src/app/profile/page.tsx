"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Eye,
  Mail,
  Calendar
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  isCertified: boolean;
  premiumActive: boolean;
  createdAt: string;
  _count: {
    mangas: number;
    followers: number;
    following: number;
  };
  mangas?: any[];
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
            return;
          }
          throw new Error("Erreur lors du chargement du profil");
        }

        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-ink-bg">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-ink-bg px-4">
        <p className="text-ink-muted text-center">{error || "Profil non trouvé"}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-6 py-2 rounded-lg bg-accent text-white font-semibold"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-ink-bg">

      {/* HEADER */}
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

      {/* AVATAR */}
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
        <p className="text-ink-muted text-sm flex items-center justify-center gap-1">
          <Mail className="w-3 h-3" />
          {profile.email}
        </p>

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

        <button className="mt-4 px-4 py-2 rounded-lg bg-accent/10 text-accent text-sm font-semibold hover:bg-accent/20 transition-colors flex items-center gap-2 mx-auto">
          <Edit className="w-4 h-4" />
          Modifier le profil
        </button>
      </section>

      {/* MANGAS */}
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

        {!profile.mangas || profile.mangas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-ink-muted/30" />
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
            {profile.mangas.map((manga: any) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className="bg-ink-card border border-ink-border rounded-xl overflow-hidden hover:border-accent transition-all active:scale-[0.97]"
              >
                <div className="aspect-[2/3] bg-gradient-to-br from-accent/20 to-accent-dark/20 flex items-center justify-center relative">
                  <BookOpen className="w-8 h-8 text-ink-muted/50" />
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

      <BottomNav />
    </div>
  );
}