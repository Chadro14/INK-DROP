"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { 
  BookOpen, 
  Film, 
  ArrowLeft, 
  Sparkles,
  AlertCircle,
  PlusCircle,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function CreatorUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // ✅ CORRECTION : Utiliser /users/me au lieu de /auth/me
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Utilisateur non trouvé");
        }

        const data = await res.json();
        setUser(data);
        
        if (data.role === "CREATOR" || data.role === "ADMIN") {
          setIsCreator(true);
        } else {
          router.push("/creator-request");
          return;
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <Loader label="Chargement..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-950/30 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Accès restreint</h2>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <Link
          href="/profile"
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          Retour au profil
        </Link>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-950/30 border border-amber-500/30 flex items-center justify-center mb-4">
          <Sparkles className="w-10 h-10 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Deviens créateur</h2>
        <p className="text-muted-foreground max-w-md">
          Tu dois être créateur pour publier du contenu sur INKDROP.
        </p>
        <Link
          href="/creator-request"
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          Faire une demande
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background text-foreground">

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link
            href="/profile"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Publier
          </span>
          <div className="w-12" />
        </div>
      </header>

      <div className="h-32 w-full bg-gradient-to-r from-background via-blue-950/40 to-background border-b border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-extrabold text-foreground">Publier du contenu</h1>
          <p className="text-muted-foreground text-sm">Choisis ce que tu veux partager</p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto w-full px-4 -mt-8 flex-1">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* AJOUTER UN CHAPITRE */}
          <Link
            href="/creator/upload/chapter"
            className="group bg-card/40 border border-border/60 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/30 transition-all">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground group-hover:text-blue-400 transition-colors">
              Ajouter un chapitre
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Ajoute un nouveau chapitre à ton manga existant
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-blue-400 font-medium">
              <PlusCircle className="w-4 h-4" />
              Commencer
            </div>
          </Link>

          {/* PUBLIER UN REEL */}
          <Link
            href="/creator/upload/video"
            className="group bg-card/40 border border-border/60 rounded-2xl p-6 text-center hover:border-purple-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/30 transition-all">
              <Film className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground group-hover:text-purple-400 transition-colors">
              Publier un Reel
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Partage une vidéo de 20-30 secondes
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-purple-400 font-medium">
              <PlusCircle className="w-4 h-4" />
              Commencer
            </div>
          </Link>

        </div>

        <div className="mt-6 p-4 bg-card/30 border border-border/60 rounded-xl">
          <p className="text-xs text-muted-foreground text-center">
            Tu peux ajouter des chapitres à tes mangas existants ou publier des Reels vidéo.
          </p>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
