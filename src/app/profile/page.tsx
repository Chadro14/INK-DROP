"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CertificationBadge } from "@/components/badges/certification-badge";
import { PremiumBadge } from "@/components/badges/premium-badge";
import { 
  BookOpen, 
  Heart, 
  Settings, 
  LogOut,
  Edit,
  Eye,
  Mail,
  Calendar,
  Plus,
  Share2,
  Award,
  Zap,
  Coins,
  ChevronRight,
  Shield,
  Palette
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  isCertified: boolean;
  premiumActive: boolean;
  premiumExpires: string | null;
  createdAt: string;
  manas: number;
  steamPoints: number;
  steamLevel: number;
  avatarColor: string | null;
  _count: {
    mangas: number;
    followers: number;
    following: number;
  };
  mangas?: any[];
  earnings?: {
    total: number;
    pending: number;
    paid: number;
  };
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
        const [profileRes, earningsRes] = await Promise.all([
          fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/dashboard/earnings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!profileRes.ok) {
          if (profileRes.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
            return;
          }
          throw new Error("Erreur lors du chargement du profil");
        }

        const profileData = await profileRes.json();

        let earningsData = null;
        if (earningsRes.ok) {
          earningsData = await earningsRes.json();
        }

        setProfile({
          ...profileData,
          earnings: earningsData || { total: 0, pending: 0, paid: 0 },
        });
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

  const handleShare = () => {
    const username = profile?.username || "utilisateur";
    const shareUrl = `https://ink-drop-one.vercel.app/creator/${username}`;

    if (navigator.share) {
      navigator.share({
        title: `INKDROP - ${username}`,
        text: `Découvre le profil de ${username} sur INKDROP !`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("📋 Lien copié !");
    }
  };

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
        <p className="text-gray-500 text-center">{error || "Profil non trouvé"}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-6 py-2 rounded-lg bg-black text-white font-semibold"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="text-xl font-bold text-black">Profil</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="text-gray-600 hover:text-black transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <Link href="/profile/settings" className="text-gray-600 hover:text-black transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* AVATAR & INFOS PUBLIQUES */}
      <section className="px-4 py-6">
        <div classNameC'est parfaitement clair. Isoler la logique visuelle et comportementale dans des composants dédiés est exactement la bonne approche pour garder une interface propre et éviter le code "plat de spaghettis" dans la page principale. 

Voici l'implémentation stricte de tes règles, avec un focus sur la lisibilité, l'accessibilité (`prefers-reduced-motion`) et la séparation des responsabilités.

### 1. Composant : Badge de Certification
Ce composant fait exactement ce qui est demandé : une taille fixe, aucune animation, et retourne `null` si l'utilisateur n'est pas certifié. L'utilisation de `lucide-react` est respectée.

**Fichier :** `src/components/badges/certification-badge.tsx`

```tsx
import { BadgeCheck } from "lucide-react";

interface CertificationBadgeProps {
  isCertified: boolean;
  color: string;
}

export function CertificationBadge({ isCertified, color }: CertificationBadgeProps) {
  if (!isCertified) return null;

  return (
    <BadgeCheck className="w-5 h-5 shrink-0" color="white" fill="{color}"/>
  );
}
