"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Check,
  Ban,
  X,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  DollarSign,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type PayoutStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

type PayoutCreator = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  avatarColor: string | null;
};

type Payout = {
  id: string;
  amount: number;
  currency: string;
  manasAmount: number;
  fee: number;
  grossAmount: number;
  operator: string;
  mobileNumber: string;
  status: PayoutStatus;
  transactionId: string | null;
  requestedAt: string;
  completedAt: string | null;
  rejectionReason: string | null;
  creator: PayoutCreator;
};

type FilterStatus = "ALL" | PayoutStatus;

const OPERATOR_LABELS: Record<string, string> = {
  orange: "Orange Money",
  mtn: "MTN Mobile Money",
  airtel: "Airtel Money",
  vodacom: "Vodacom M-Pesa",
  mpesa: "M-Pesa",
};

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; reason: string } | null>(null);

  // ============================================
  // CHARGER LES DONNÉES
  // ============================================
  const fetchPayouts = async (status: FilterStatus = filter, pageNum: number = page) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (status !== "ALL") params.set("status", status);
      params.set("page", String(pageNum));
      params.set("limit", "20");

      const res = await fetch(`${API_URL}/admin/payouts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        if (res.status === 403) {
          throw new Error("Accès refusé. Vous n'êtes pas administrateur.");
        }
        throw new Error("Erreur de chargement");
      }

      const data = await res.json();
      setPayouts(data.data || []);
      setTotal(data.meta?.total || 0);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts(filter, 1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(t);
  }, [success]);

  // ============================================
  // ACTIONS ADMIN
  // ============================================
  const handleApprove = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessingId(id);
    try {
      const res = await fetch(`${API_URL}/admin/payouts/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      setSuccess("Retrait approuvé — passé en traitement");
      fetchPayouts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessingId(id);
    try {
      const res = await fetch(`${API_URL}/admin/payouts/${id}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      setSuccess("Retrait marqué comme envoyé");
      fetchPayouts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setProcessingId(id);
    try {
      const res = await fetch(`${API_URL}/admin/payouts/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      setSuccess("Retrait refusé et remboursé");
      setRejectModal(null);
      fetchPayouts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================
  // HELPERS
  // ============================================
  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "En attente",
          icon: Clock,
          className:
            "text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/30",
        };
      case "PROCESSING":
        return {
          label: "En traitement",
          icon: Loader2,
          className:
            "text-blue-600 dark:text-blue-400 bg-blue-500/15 border-blue-500/30",
        };
      case "COMPLETED":
        return {
          label: "Envoyé",
          icon: Check,
          className:
            "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
        };
      case "FAILED":
        return {
          label: "Échoué",
          icon: Ban,
          className:
            "text-rose-600 dark:text-rose-400 bg-rose-500/15 border-rose-500/30",
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderAvatar = (creator: PayoutCreator, size = "w-10 h-10") => {
    if (creator.avatarUrl) {
      return (
        <img
          src={creator.avatarUrl}
          alt={creator.username}
          className={`${size} rounded-full object-cover shrink-0`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}
        style={{ backgroundColor: creator.avatarColor || "#8B5CF6" }}
      >
        {creator.username?.charAt(0).toUpperCase() || "?"}
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  if (loading && payouts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader label="Chargement des retraits..." />
      </div>
    );
  }

  // Stats rapides (calculées sur la page courante)
  const pendingCount = payouts.filter((p) => p.status === "PENDING").length;
  const processingCount = payouts.filter((p) => p.status === "PROCESSING").length;
  const completedCount = payouts.filter((p) => p.status === "COMPLETED").length;
  const totalPendingAmount = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link
            href="/profile"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium p-2 rounded-full hover:bg-card"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Retour</span>
          </Link>
          <span className="text-base font-bold tracking-tight text-foreground/90 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-500" />
            Retraits
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* ALERTES */}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-sm flex items-center gap-2 animate-slide-down">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-sm flex items-center gap-2 animate-slide-down">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="bg-card/60 border border-border/80 rounded-2xl p-3.5">
            <Clock className="w-4 h-4 text-amber-500 mb-1" />
            <p className="text-base md:text-lg font-black text-foreground">
              {pendingCount}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium">
              En attente
            </p>
          </div>
          <div className="bg-card/60 border border-border/80 rounded-2xl p-3.5">
            <Loader2 className="w-4 h-4 text-blue-500 mb-1" />
            <p className="text-base md:text-lg font-black text-foreground">
              {processingCount}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium">
              En traitement
            </p>
          </div>
          <div className="bg-card/60 border border-border/80 rounded-2xl p-3.5">
            <Check className="w-4 h-4 text-emerald-500 mb-1" />
            <p className="text-base md:text-lg font-black text-foreground">
              {completedCount}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium">
              Envoyés (page)
            </p>
          </div>
          <div className="bg-card/60 border border-border/80 rounded-2xl p-3.5">
            <DollarSign className="w-4 h-4 text-emerald-500 mb-1" />
            <p className="text-base md:text-lg font-black text-foreground truncate">
              ${totalPendingAmount.toFixed(0)}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium">
              À payer (page)
            </p>
          </div>
        </div>

        {/* FILTRES */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(
            [
              { value: "PENDING", label: "En attente" },
              { value: "PROCESSING", label: "En traitement" },
              { value: "COMPLETED", label: "Envoyés" },
              { value: "FAILED", label: "Échoués" },
              { value: "ALL", label: "Tous" },
            ] as { value: FilterStatus; label: string }[]
          ).map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                filter === f.value
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                  : "bg-card text-muted-foreground border-border hover:border-border/80 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* LISTE */}
        {payouts.length === 0 ? (
          <div className="text-center py-16 bg-card/40 rounded-2xl border border-border/60">
            <Wallet className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              Aucun retrait {filter === "ALL" ? "" : filter === "PENDING" ? "en attente" : filter === "PROCESSING" ? "en traitement" : filter === "COMPLETED" ? "envoyé" : "échoué"}
            </p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Les demandes apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {payouts.map((payout, index) => {
              const badge = getStatusBadge(payout.status);
              const BadgeIcon = badge.icon;
              const isPending = payout.status === "PENDING";
              const isProcessing = payout.status === "PROCESSING";
              const isDone = payout.status === "COMPLETED" || payout.status === "FAILED";
              const busy = processingId === payout.id;

              return (
                <div
                  key={payout.id}
                  style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                  className="bg-card/60 border border-border/60 rounded-2xl p-4 animate-notif-in"
                >
                  <div className="flex items-start gap-3">
                    {renderAvatar(payout.creator)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground truncate">
                            @{payout.creator.username}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {payout.creator.email}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[9px] font-bold flex items-center gap-1 shrink-0 ${badge.className}`}
                        >
                          <BadgeIcon className="w-2.5 h-2.5" />
                          {badge.label}
                        </span>
                      </div>

                      {/* Montant */}
                      <div className="mt-2 p-2 rounded-lg bg-background/60 border border-border/40 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="font-bold text-foreground">
                            {payout.amount.toFixed(2)} USD
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          {payout.manasAmount} MANAS
                        </span>
                      </div>

                      {/* Détails */}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          {OPERATOR_LABELS[payout.operator] || payout.operator}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="font-mono">{payout.mobileNumber}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{formatDate(payout.requestedAt)}</span>
                      </div>

                      {payout.rejectionReason && (
                        <div className="mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-[10px] flex items-start gap-1.5">
                          <ShieldAlert className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{payout.rejectionReason}</span>
                        </div>
                      )}

                      {/* ACTIONS */}
                      {!isDone && (
                        <div className="mt-3 flex gap-2">
                          {isPending && (
                            <button
                              onClick={() => handleApprove(payout.id)}
                              disabled={busy}
                              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              {busy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Approuver
                                </>
                              )}
                            </button>
                          )}
                          {isProcessing && (
                            <button
                              onClick={() => handleComplete(payout.id)}
                              disabled={busy}
                              className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              {busy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Marquer envoyé
                                </>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setRejectModal({ id: payout.id, reason: "" })
                            }
                            disabled={busy}
                            className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-2">
            <button
              onClick={() => {
                const p = Math.max(1, page - 1);
                setPage(p);
                fetchPayouts(filter, p);
              }}
              disabled={page === 1 || loading}
              className="p-2 rounded-xl bg-card border border-border hover:border-border/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page} / {totalPages} · {total} retrait{total !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => {
                const p = Math.min(totalPages, page + 1);
                setPage(p);
                fetchPayouts(filter, p);
              }}
              disabled={page === totalPages || loading}
              className="p-2 rounded-xl bg-card border border-border hover:border-border/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading overlay quand on recharge */}
        {loading && payouts.length > 0 && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-4 py-2 shadow-2xl flex items-center gap-2 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
            <span>Actualisation...</span>
          </div>
        )}
      </main>

      {/* MODAL REFUS */}
      {rejectModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-modal-backdrop"
          onClick={() => !processingId && setRejectModal(null)}
        >
          <div
            className="bg-background border-t md:border border-border/80 rounded-t-3xl md:rounded-2xl w-full md:max-w-md overflow-hidden shadow-2xl animate-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-500" />
                Refuser le retrait ?
              </h3>
              <button
                onClick={() => !processingId && setRejectModal(null)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Les MANAS du créateur seront <strong>remboursés intégralement</strong> et les frais prélevés à la plateforme seront annulés.
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Raison du refus
                </label>
                <textarea
                  value={rejectModal.reason}
                  onChange={(e) =>
                    setRejectModal({ ...rejectModal, reason: e.target.value })
                  }
                  placeholder="Ex : Numéro mobile invalide, opérateur incorrect..."
                  maxLength={300}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-rose-500 outline-none transition-all text-sm resize-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1 text-right">
                  {rejectModal.reason.length}/300
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRejectModal(null)}
                  disabled={!!processingId}
                  className="flex-1 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() =>
                    handleReject(rejectModal.id, rejectModal.reason || "Refusé par admin")
                  }
                  disabled={!!processingId}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processingId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      Refuser
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />

      <style jsx>{`
        @keyframes notif-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-notif-in {
          animation: notif-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.25s ease-out both;
        }

        @keyframes modal-backdrop {
          from { opacity: 0; }
          to { opacity: 1; }
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
