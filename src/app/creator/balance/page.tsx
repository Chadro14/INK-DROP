"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  DollarSign,
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Smartphone,
  Ban,
  Clock,
  Check,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";
const RATE = 100; // 100 MANAS = 1 USD
const MIN_WITHDRAWAL_MANAS = 1000; // 10 USD
const WITHDRAWAL_FEE_USD = 2; // 2 USD fixes
const MAX_DAILY_WITHDRAWAL_USD = 50; // 50 USD/jour

type BalanceInfo = {
  balance: number;
  username: string;
};

type WithdrawalHistory = {
  id: string;
  amount: number;
  manasAmount: number;
  fee: number;
  grossAmount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  mobileNumber: string;
  operator: string;
  rejectionReason?: string | null;
  createdAt: string;
  completedAt?: string | null;
};

const OPERATORS = [
  { value: "orange", label: "Orange Money" },
  { value: "mtn", label: "MTN Mobile Money" },
  { value: "airtel", label: "Airtel Money" },
  { value: "vodacom", label: "Vodacom M-Pesa" },
];

export default function CreatorBalancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);
  const [history, setHistory] = useState<WithdrawalHistory[]>([]);
  const [amountManas, setAmountManas] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [operator, setOperator] = useState("orange");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxWithdrawalManas = balanceInfo?.balance || 0;

  // ============================================
  // CHARGER LES DONNÉES
  // ============================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [balanceRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/manas/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/manas/withdrawals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setBalanceInfo(data);
      }

      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(Array.isArray(data) ? data : data.history || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CALCULS
  // ============================================
  const manasAmount = parseInt(amountManas) || 0;
  const usdAmount = manasAmount / RATE;
  const netAmount = Math.max(0, usdAmount - WITHDRAWAL_FEE_USD);
  const isMinAmount = manasAmount >= MIN_WITHDRAWAL_MANAS;
  const isMaxAmount = manasAmount <= maxWithdrawalManas;
  const isValidAmount = isMinAmount && isMaxAmount && manasAmount > 0;

  // ============================================
  // DEMANDE DE RETRAIT
  // ============================================
  const handleWithdrawal = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!isValidAmount) {
      setError(`Veuillez entrer un montant valide (min ${MIN_WITHDRAWAL_MANAS} MANAS)`);
      return;
    }

    if (!mobileNumber || mobileNumber.length < 8) {
      setError("Veuillez entrer un numéro de téléphone valide");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/manas/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          manasAmount,
          mobileNumber,
          operator,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la demande");
      }

      setSuccess(`Demande de retrait de ${netAmount.toFixed(2)} USD envoyée`);
      setAmountManas("");
      setMobileNumber("");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // HELPERS
  // ============================================
  const getStatusBadge = (status: string) => {
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
          label: "Terminé",
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
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: "text-muted-foreground bg-muted border-border",
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

  // ============================================
  // MANA COIN (comme sur le profil)
  // ============================================
  const ManaCoin = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="url(#manaGradient)" stroke="#FBBF24" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="#D97706" strokeWidth="0.5" opacity="0.5" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="12"
        fontWeight="800"
        fill="#78350F"
        fontFamily="Arial, sans-serif"
      >
        M
      </text>
      <defs>
        <linearGradient id="manaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader label="Chargement de votre balance..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-card flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <span className="text-base font-bold tracking-tight text-foreground/90 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Balance
          </span>
          <Link
            href="/profile"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Profil
          </Link>
        </div>
      </header>

      {/* BANNIÈRE */}
      <div className="h-20 md:h-28 w-full bg-gradient-to-r from-background via-emerald-950/30 to-background border-b border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_50%)]" />
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 -mt-6">

        {/* ===== SOLDE ===== */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                Votre solde
              </p>
              <p className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2 mt-1">
                <ManaCoin className="w-7 h-7 md:w-8 md:h-8 shrink-0" />
                <span className="truncate">{balanceInfo?.balance || 0} MANAS</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ≈ {((balanceInfo?.balance || 0) / RATE).toFixed(2)} USD
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground font-medium">Taux</p>
              <p className="text-sm font-bold text-emerald-500">
                100 MANAS = 1 USD
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Frais : 2 USD fixes
              </p>
            </div>
          </div>
        </div>

        {/* ===== FORMULAIRE DE RETRAIT ===== */}
        <div className="bg-card/60 border border-border/80 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            Retirer des MANAS
          </h3>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Montant en MANAS */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Montant en MANAS
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  <ManaCoin className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  value={amountManas}
                  onChange={(e) => setAmountManas(e.target.value)}
                  placeholder="1000"
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="flex items-center justify-between mt-1 flex-wrap gap-1">
                <p className="text-[10px] text-muted-foreground">
                  Min : {MIN_WITHDRAWAL_MANAS} MANAS ({MIN_WITHDRAWAL_MANAS / RATE} USD) • Max : {maxWithdrawalManas} MANAS
                </p>
                <span className="text-[10px] text-muted-foreground">
                  ≈ {usdAmount.toFixed(2)} USD
                </span>
              </div>
              {manasAmount > 0 && (
                <div className="mt-2 p-2 bg-background/60 border border-border/60 rounded-lg text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Montant brut</span>
                    <span>{usdAmount.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frais</span>
                    <span>-{WITHDRAWAL_FEE_USD.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-foreground font-bold border-t border-border/60 pt-1 mt-1">
                    <span>Net à recevoir</span>
                    <span className="text-emerald-500">
                      {netAmount.toFixed(2)} USD
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Numéro de téléphone
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Smartphone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="812345678"
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Exemple : 812345678
              </p>
            </div>

            {/* Opérateur */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Opérateur
              </label>
              <div className="grid grid-cols-2 gap-2">
                {OPERATORS.map((op) => (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => setOperator(op.value)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                      operator === op.value
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground bg-card"
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleWithdrawal}
              disabled={isSubmitting || !isValidAmount || mobileNumber.length < 8}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Retirer {netAmount.toFixed(2)} USD
                </>
              )}
            </button>

            {manasAmount > 0 && !isMinAmount && (
              <p className="text-xs text-rose-500 dark:text-rose-400 text-center flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Le montant minimum est de {MIN_WITHDRAWAL_MANAS} MANAS (10 USD)
              </p>
            )}
            {manasAmount > maxWithdrawalManas && (
              <p className="text-xs text-rose-500 dark:text-rose-400 text-center flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Solde insuffisant
              </p>
            )}
          </div>
        </div>

        {/* ===== HISTORIQUE DES RETRAITS ===== */}
        <div className="bg-card/40 border border-border/60 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Historique des retraits
            </h3>
            <span className="text-xs text-muted-foreground">
              {history.length} retrait{history.length !== 1 ? "s" : ""}
            </span>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Aucun retrait effectué
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {history.map((item) => {
                const badge = getStatusBadge(item.status);
                const BadgeIcon = badge.icon;
                const displayAmount = item.amount ?? (item.manasAmount / RATE - WITHDRAWAL_FEE_USD);

                return (
                  <div key={item.id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                          <ManaCoin className="w-4 h-4 shrink-0" />
                          <span className="truncate">
                            {item.manasAmount} MANAS
                            <span className="text-muted-foreground font-normal">
                              {" "}→ {displayAmount.toFixed(2)} USD
                            </span>
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {OPERATORS.find((o) => o.value === item.operator)?.label || item.operator}
                          {" • "}
                          {item.mobileNumber}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </p>
                        {item.status === "FAILED" && item.rejectionReason && (
                          <p className="text-[10px] text-rose-500 dark:text-rose-400 mt-1">
                            Raison : {item.rejectionReason}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 shrink-0 ${badge.className}`}
                      >
                        <BadgeIcon className="w-2.5 h-2.5" />
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-muted-foreground">
            Les retraits sont traités sous 24-48h
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
