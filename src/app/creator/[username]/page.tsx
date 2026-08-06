"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BookOpen, Heart, Eye, BadgeCheck, Mail, Calendar, ArrowLeft } from "lucide-react";

// URL de ton backend
const API_URL = "https://ink-backend.vercel.app";

// Définition du type pour le profil utilisateur
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
  badgeColor?: string | null;
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

  // Récupération du username depuis l'URL
  const username = params.username as string;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/users/username/${username}?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!res.ok) {
          throw new Error("Utilisateur non trouvé");
        }
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        console.error("Erreur fetch profil public:", err);
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

  // Application dynamique de la couleur du badge et de l'avatar
  const activeBadgeColor = profile.badgeColor || profile.avatarColor || "#FFD700";
  const themeColor = profile.avatarColor || "#000000";

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-white selection:bg-black selection:text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="text-gray-600 hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <span className="text-lg font-extrabold text-black truncate max-w-[150px]">
            @{profile.username.toLowerCase()}
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* BANNIÈRE DYNAMIQUE (Utilise avatarColor) */}
      <div 
        className="h-28 w-full border-b border-gray-100 transition-colors duration-300"
        style={{ backgroundColor: profile.avatarColor || "#F9FAFB" }}
      />

      {/* AVATAR & INFOS */}
      <section className="px-4 -mt-12 mb-6">
        <div className="flex items-end gap-4 max-w-lg mx-auto">
          <div className="relative flex-shrink-0">
            {/* AVATAR DYNAMIQUE (Fond de la couleur choisie si pas de photo) */}
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black overflow-hidden border-4 border-white shadow-md transition-colors duration-300"
              style={{ 
                backgroundColor: profile.avatarUrl ? "#F3F4F6" : themeColor,
                color: profile.avatarUrl ? "#000000" : "#FFFFFF"
              }}
            >
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

            {/* Badge de certification sur l'avatar */}
            {profile.isCertified && (
              <div className="absolute bottom-0 right-0 bg-white p-0.5 rounded-full shadow-sm">
                <BadgeCheck
                  className="w-7 h-7"
                  fill={activeBadgeColor}
                  color="black"
                  strokeWidth={1.5}
                />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-black text-black truncate">{profile.username}</h1>
              {profile.premiumActive && (
                <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-wider">
                  PRO
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 text-gray-500 text-sm">
              <p className="font-medium">{profile.bio || "Aucune bio disponible..."}</p>
              <div className="flex flex-col text-gray-400 text-xs">
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Membre depuis {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STYLE COMPTEUR */}
      <section className="px-4 py-4 border-t border-b border-gray-100 bg-gray-50/50">
        <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
          <div className="text-center py-1">
            <p className="text-2xl font-black text-black">{profile._count?.mangas || 0}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mangas</p>
          </div>
          <div className="text-center py-1 border-l border-r border-gray-100">
            <p className="text-2xl font-black text-black">{profile._count?.followers || 0}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Abonnés</p>
          </div>
          <div className="text-center py-1">
            <p className="text-2xl font-black text-black">{profile._count?.following || 0}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Abonnements</p>
          </div>
        </div>
      </section>

      {/* MANGAS PUBLIÉS (GRILLE) */}
      <section className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-gray-900 text-sm font-bold uppercase tracking-wider">Mangas publiés</h2>
        </div>

        {!profile.mangas || profile.mangas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-xl border border-gray-100">
            <BookOpen className="w-16 h-16 text-gray-300" />
            <p className="text-gray-500 mt-5 text-sm font-medium">Aucun manga publié pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {profile.mangas.map((manga: any) => (
              <Link
                key={manga.id}
                href={`/manga/${manga.id}`}
                className="group relative aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-100 hover:border-black/20 hover:scale-[1.02] transition-all duration-200 shadow-sm"
              >
                {manga.coverUrl || manga.imageUrl ? (
                  <img 
                    src={manga.coverUrl || manga.imageUrl} 
                    alt={manga.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-100 transition-opacity" />
                
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                  <p className="text-white text-xs md:text-sm font-bold truncate group-hover:text-yellow-400">{manga.title}</p>
                  <div className="flex items-center gap-2.5 text-white/80 text-[10px] md:text-xs font-semibold mt-0.5">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400 fill-red-400" /> {manga.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-sky-400" /> {manga.viewsCount || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Navigation inférieure */}
      <BottomNav />
    </div>
  );
}
