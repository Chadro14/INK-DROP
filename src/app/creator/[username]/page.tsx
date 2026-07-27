"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BookOpen, Heart, Eye, BadgeCheck, Mail, Calendar, ArrowLeft } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  avatarColor: string | null;
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

export default function PublicProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const username = params.username as string;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/users/username/${username}`);
        if (!res.ok) {
          throw new Error("Utilisateur non trouvé");
        }
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-4">
        <p className="text-gray-500 text-center">{error || "Utilisateur non trouvé"}</p>
        <Link href="/" className="mt-4 px-6 py-2 rounded-lg bg-black text-white font-semibold">
          Retourner à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="text-gray-600 hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-lg font-bold text-black truncate max-w-[150px]">{profile.username}</span>
          <div className="w-16" />
        </div>
      </header>

      {/* AVATAR & INFOS */}
      <section className="px-4 py-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-3xl font-bold text-black overflow-hidden border-2 border-black">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.username?.charAt(0).toUpperCase() || "?"
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-black truncate">{profile.username}</h1>
              {profile.isCertified && (
                <BadgeCheck
                  className="w-5 h-5 flex-shrink-0"
                  fill={profile.avatarColor || "#FFD700"}
                  color="white"
                  strokeWidth={1.5}
                />
              )}
              {profile.premiumActive && (
                <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                  PRO
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm truncate">{profile.bio || "Aucune bio"}</p>
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
              <Mail className="w-3 h-3" />
              <span className="truncate">{profile.email}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Calendar className="w-3 h-3" />
              <span>Membre depuis {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 py-3 border-t border-b border-gray-100">
        <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
          <div className="text-center">
            <p className="text-lg font-bold text-black">{profile._count?.mangas || 0}</p>
            <p className="text-xs text-gray-500">Mangas</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-black">{profile._count?.followers || 0}</p>
            <p className="text-xs text-gray-500">Abonnés</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-black">{profile._count?.following || 0}</p>
            <p className="text-xs text-gray-500">Abonnements</p>
          </div>
        </div>
      </section>

      {/* MANGAS */}
      <section className="flex-1 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Mangas publiés</h2>
        </div>

        {!profile.mangas || profile.mangas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 mt-4 text-sm">Aucun manga publié</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {profile.mangas.map((manga: any) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className="group relative aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200"
              >
                {manga.coverUrl ? (
                  <img 
                    src={manga.coverUrl} 
                    alt={manga.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-xs font-medium truncate">{manga.title}</p>
                  <div className="flex items-center gap-2 text-white/70 text-[10px]">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3" /> {manga.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3" /> {manga.viewsCount || 0}
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