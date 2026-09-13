"use client";

import { useState } from "react";
import {
  Coins,
  Ticket,
  X,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Props = {
  chapter: {
    id: string;
    number: number;
    title: string | null;
    price: number;
  };
  manga: {
    id: string;
    title: string;
  };
  userBalance: {
    manas: number;
    tickets: number;
  };
  onClose: () => void;
  onSuccess: () => void;
};

export function ChapterPurchaseModal({
  chapter,
  manga,
  userBalance,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState<"manas" | "ticket" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const price = chapter.price || 50;
  const canPayManas = userBalance.manas >= price;
  const canUseTicket = userBalance.tickets >= 1;

  // ============================================
  // ACHAT AVEC MANAS
  // ============================================
  const handleBuyWithManas = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setError("");
    setSuccess("");
    setLoading("manas");

    try {
      const res = await fetch(`${API_URL}/manas/purchase-chapter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mangaId: manga.id,
          chapterNumber: chapter.number,
          priceInManas: price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'achat");
      }

      setSuccess("Chapitre débloqué avec succès");
      setTimeout(() => {
        onSuccess();
      }, 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  // ============================================
  // UTILISER UN TICKET
  // ============================================
  const handleUseTicket = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setError("");
    setSuccess("");
    setLoading("ticket");

    try {
      const res = await fetch(`${API_URL}/tickets/use`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chapterId: chapter.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'utilisation du ticket");
      }

      setSuccess("Chapitre débloqué pendant 2 heures");
      setTimeout(() => {
        onSuccess();
      }, 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-modal-backdrop"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-background border-t md:border border-border/80 rounded-t-3xl md:rounded-2xl w-full md:max-w-md overflow-hidden shadow-2xl animate-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">
                Chapitre {chapter.number}
                {chapter.title ? ` — ${chapter.title}` : ""}
              </h3>
              <p className="text-[10px] text-muted-foreground truncate">
                {manga.title}
              </p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose()}
            disabled={!!loading}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all disabled:opacity-50 shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-5 py-5 space-y-3">
          {/* ERREUR */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCÈS */}
          {success && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* PRIX */}
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground">Prix du chapitre</p>
            <p className="text-2xl font-black text-foreground flex items-center justify-center gap-2 mt-1">
              <Coins className="w-5 h-5 text-amber-500" />
              {price} MANAS
            </p>
          </div>

          {/* OPTION MANAS */}
          <button
            type="button"
            onClick={handleBuyWithManas}
            disabled={!canPayManas || !!loading}
            className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/60 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                {loading === "manas" ? (
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                ) : (
                  <Coins className="w-5 h-5 text-emerald-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Acheter avec MANAS
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Accès permanent
                </p>
                <p
                  className={`text-[10px] mt-0.5 font-medium ${
                    canPayManas
                      ? "text-muted-foreground"
                      : "text-rose-500 dark:text-rose-400"
                  }`}
                >
                  Solde : {userBalance.manas} MANAS
                  {!canPayManas && " — insuffisant"}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              {price} M
            </span>
          </button>

          {/* OPTION TICKET */}
          <button
            type="button"
            onClick={handleUseTicket}
            disabled={!canUseTicket || !!loading}
            className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl border-2 border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/60 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-500/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                {loading === "ticket" ? (
                  <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                ) : (
                  <Ticket className="w-5 h-5 text-purple-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Utiliser 1 ticket
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Accès pendant 2 heures
                </p>
                <p
                  className={`text-[10px] mt-0.5 font-medium ${
                    canUseTicket
                      ? "text-muted-foreground"
                      : "text-rose-500 dark:text-rose-400"
                  }`}
                >
                  Tu as {userBalance.tickets} ticket
                  {userBalance.tickets !== 1 ? "s" : ""}
                  {!canUseTicket && " — insuffisant"}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 shrink-0">
              1
            </span>
          </button>

          {/* INFO */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/40 border border-border/60 text-[10px] text-muted-foreground">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              L'achat avec MANAS donne un accès <strong>permanent</strong>. Le ticket donne un accès de <strong>2 heures</strong>.
            </span>
          </div>

          {/* BOUTON ANNULER */}
          <button
            type="button"
            onClick={() => !loading && onClose()}
            disabled={!!loading}
            className="w-full py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-sm font-bold transition-all disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modal-backdrop {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-modal-backdrop {
          animation: modal-backdrop 0.2s ease-out both;
        }

        @keyframes modal-panel {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-modal-panel {
          animation: modal-panel 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (max-width: 768px) {
          @keyframes modal-panel {
            from {
              opacity: 0;
              transform: translateY(100%);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
      `}</style>
    </div>
  );
}
