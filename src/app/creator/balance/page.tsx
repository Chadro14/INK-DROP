"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Coins,
  DollarSign,
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Smartphone,
  Users,
  Crown,
  Shield
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type BalanceInfo = {
  balance: number;
  username: string;
};

type WithdrawalHistory = {
  id: string;
  amount: number;
  manasAmount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  mobileNumber: string;
  operator: string;
  createdAt: string;
};

const RATE = 100; // 100 MANAS = 1$

export default function CreatorBalancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);
  const [history, setHistory] = useState<WithdrawalHistory[]>([]);
  const [amountManas, setAmountManas] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [operator, setOperator] = useState<"orange" | "mpesa">("orange");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [minWithdrawalManas] = useState(909); // 10$
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
        fetch(`${API_URL}/manas/withdrawal-history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setBalanceInfo(data);
      }

      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(data.history || []);
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
  const fee = usdAmount * 0.05; // 5% de frais
  const netAmount = usdAmount - fee;
  const isMinAmount = manasAmount >= minWithdrawalManas;
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
      setError("Veuillez entrer un montant valide (min 909 MANAS)");
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
      const res = await fetch(`${API_URL}/manas/withdrawal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          manasAmount: manasAmount,
          mobileNumber: mobileNumber,
          operator: operator,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la demande");
      }

      setSuccess(`✅ Demande de retrait de ${usdAmount.toFixed(2)}$ envoyée !`);
      setAmountManas("");
      setMobileNumber("");
      fetchData(); // Rafraîchir les données
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
      PROCESSING: "text-blue-400 bg-blue-500/20 border-blue-500/30",
      COMPLETED: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      FAILED: "text-rose-400 bg-rose-500/20 border-rose-500/30",
    };
    return colors[status] || "text-zinc-400 bg-zinc-500/20 border-zinc-500/30";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "En attente",
      PROCESSING: "En traitement",
      COMPLETED: "Terminé",
      FAILED: "Échoué",
    };
    return labels[status] || status;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader size={32} color="#3B82F6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white">

      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <span className="text-base font-bold tracking-tight text-white/90 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Balance
          </span>
          <Link
            href="/profile"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Profil
          </Link>
        </div>
      </header>

      <div className="h-20 md:h-28 w-full bg-gradient-to-r from-zinc-950 via-emerald-950/30 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_50%)]" />
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 -mt-6">

        {/* ===== SOLDE ===== */}
        <div className="bg-gradient-to-r from-emerald-950/30 to-teal-950/30 border border-emerald-500/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-medium">Votre solde</p>
              <p className="text-3xl font-extrabold text-white flex items-center gap-2">
                <Coins className="w-8 h-8 text-emerald-400" />
                {balanceInfo?.balance || 0} MANAS
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                ≈ {(balanceInfo?.balance || 0) / RATE} USD
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-400 font-medium">Taux</p>
              <p className="text-sm font-bold text-emerald-400">100 MANAS = 1$</p>
              <p className="text-xs text-zinc-500 mt-1">Frais : 5%</p>
            </div>
          </div>
        </div>

        {/* ===== FORMULAIRE DE RETRAIT ===== */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            Retirer des MANAS
          </h3>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Montant en MANAS */}
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                Montant en MANAS
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Coins className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  value={amountManas}
                  onChange={(e) => setAmountManas(e.target.value)}
                  placeholder="909"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-zinc-500">
                  Min : 909 MANAS (10$) • Max : {maxWithdrawalManas} MANAS
                </p>
                <span className="text-[10px] text-zinc-500">
                  ≈ {usdAmount.toFixed(2)}$ (frais inclus)
                </span>
              </div>
              {manasAmount > 0 && (
                <div className="mt-2 p-2 bg-zinc-950/60 border border-zinc-800/60 rounded-lg text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Montant brut</span>
                    <span>{usdAmount.toFixed(2)}$</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Frais (5%)</span>
                    <span>-{fee.toFixed(2)}$</span>
                  </div>
                  <div className="flex justify-between text-white font-bold border-t border-zinc-800/60 pt-1 mt-1">
                    <span>Net</span>
                    <span className="text-emerald-400">{netAmount.toFixed(2)}$</span>
                  </div>
                </div>
              )}
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                Numéro de téléphone
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Smartphone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="812345678"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Exemple: 812345678</p>
            </div>

            {/* Opérateur */}
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                Opérateur
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOperator("orange")}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    operator === "orange"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  Orange Money
                </button>
                <button
                  onClick={() => setOperator("mpesa")}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    operator === "mpesa"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  M-Pesa
                </button>
              </div>
            </div>

            <button
              onClick={handleWithdrawal}
              disabled={isSubmitting || !isValidAmount}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Retirer {netAmount.toFixed(2)}$
                </>
              )}
            </button>

            {!isMinAmount && manasAmount > 0 && (
              <p className="text-xs text-rose-400 text-center">
                ⚠️ Le montant minimum est de 909 MANAS (10$)
              </p>
            )}
          </div>
        </div>

        {/* ===== HISTORIQUE DES RETRAITS ===== */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Historique des retraits
            </h3>
            <span className="text-xs text-zinc-500">{history.length} retraits</span>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              Aucun retrait effectué
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/40">
              {history.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.manasAmount} MANAS → {item.amount.toFixed(2)}$
                    </p>
                    <p className="text-xs text-zinc-400">
                      {item.operator === "orange" ? "Orange Money" : "M-Pesa"} • {item.mobileNumber}
                    </p>
                    <p className="text-[10px] text-zinc-500">{formatDate(item.createdAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-zinc-600">
            ✦ Les retraits sont traités sous 24-48h ✦
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
