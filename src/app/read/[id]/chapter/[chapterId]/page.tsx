"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Page = {
  url: string;
};

export default function ChapterReader() {
  const params = useParams();
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState("");

  const mangaId = params.id as string;
  const chapterId = params.chapterId as string;

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch(`${API_URL}/manga-api/chapter/${chapterId}/pages`);
        if (!res.ok) {
          throw new Error("Impossible de charger les pages");
        }
        const data = await res.json();
        if (data.data && data.data.pages && data.data.pages.length > 0) {
          setPages(data.data.pages);
        } else {
          setError("Aucune page disponible pour ce chapitre");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) {
      fetchPages();
    }
  }, [chapterId]);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 px-4">
        <p className="text-zinc-400 text-center">{error || "Aucune page disponible"}</p>
        <Link href={`/read/${mangaId}`} className="mt-4 px-6 py-2.5 rounded-full bg-purple-600 text-white font-semibold">
          Retourner au manga
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">

      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-zinc-400">
            Page {currentPage + 1} / {pages.length}
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="relative max-w-3xl w-full">
          {pages[currentPage]?.url ? (
            <img
              src={pages[currentPage].url}
              alt={`Page ${currentPage + 1}`}
              className="w-full h-auto rounded-lg shadow-2xl"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-96 bg-zinc-900 rounded-lg">
                      <p class="text-zinc-500 text-sm">Image non disponible</p>
                      <p class="text-zinc-600 text-xs mt-2">Page ${currentPage + 1}</p>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-96 bg-zinc-900 rounded-lg">
              <p className="text-zinc-500 text-sm">Image non disponible</p>
              <p className="text-zinc-600 text-xs mt-2">Page {currentPage + 1}</p>
            </div>
          )}

          {currentPage > 0 && (
            <button
              onClick={prevPage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {currentPage < pages.length - 1 && (
            <button
              onClick={nextPage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}