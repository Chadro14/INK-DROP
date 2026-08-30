"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import { ArrowLeft, AlertCircle, Shield } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function ChapterNewRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const mangaId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mangaTitle, setMangaTitle] = useState("");
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!mangaId) {
        setError("Manga non trouvé");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // ✅ Vérifier si l'utilisateur est l'auteur du manga
        const res = await fetch(`${API_URL}/mangas/${mangaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Manga non trouvé");
        }

        const data = await res.json();
        const mangaData = data.data || data;
        setMangaTitle(mangaData.title || "Manga");

        // ✅ Vérifier si l'utilisateur est l'auteur
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (meRes.ok) {
          const meData = await meRes.json();
          const isAuthorCheck = mangaData.authorId === meData.id || meData.role === "ADMIN";
          setIsAuthor(isAuthorCheck);

          if (!isAuthorCheck) {
            setError("Vous n'êtes pas l'auteur de ce manga");
            setLoading(false);
            return;
          }

          // ✅ Rediriger vers la page de création avec mangaId en paramètre
          router.replace(`/creator/upload/chapter?mangaId=${mangaId}`);
        } else {
          throw new Error("Erreur de vérification des droits");
        }

      } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
        setLoading(false);
      }
    };

    checkAccess();
  }, [mangaId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader message="Vérification des droits d'accès..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-950/30 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Accès refusé</h2>
        <p className="text-zinc-400 max-w-md">{error}</p>
        <div className="flex gap-3 mt-6">
          <Link
            href={`/manga/${mangaId}`}
            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/20"
          >
            Retourner au manga
          </Link>
          <Link
            href="/profile"
            className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-all border border-zinc-700/50"
          >
            Retour au profil
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
