"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Coins,
  History,
  TrendingUp,
  TrendingDown,
  Clock,
  BookOpen,
  Heart,
  MessageCircle,
  Users,
  Crown,
  Gift,
  Zap,
  AlertCircle,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Transaction = {
  id: string;
  amount: number;
  type: string;
  description: string;
  metadata: any;
  createdAt: string;
};

const TRANSACTION_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  DAILY_BONUS: { label: "Bonus quotidien", icon: Gift, color: "text-emerald-400" },
  READING: { label: "Lecture de chapitre", icon: BookOpen, color: "text-blue-400" },
  LIKE_RECEIVED: { label: "Like reçu", icon: Heart, color: "text-rose-400" },
  COMMENT_RECEIVED: { label: "Commentaire reçu", icon: MessageCircle, color: "text-purple-400" },
  SUBSCRIBER: { label: "Nouvel abonné", icon: Users, color: "text-indigo-400" },
  CHAPTER_PURCHASE: { label: "Achat de chapitre", icon: BookOpen, color: "text-amber-400" },
  TIP_SENT: { label: "Pourboire envoyé", icon: Heart, color: "text-rose-400" },
  TIP_RECEIVED: { label: "Pourboire reçu", icon: Heart, color: "text-emerald-400" },
  PREMIUM_BONUS: { label: "Bonus Premium", icon: Crown, color: "text-amber-400" },
  ADMIN_GRANT: { label: "Ajout par admin", icon: Zap, color: "text-blue-400" },
  BALANCE_WITHDRAWAL: { label: "Retrait", icon: TrendingDown, color: "text-rose-400" },
  BALANCE_DEPOSIT: { label: "Dépôt", icon: TrendingUp, color: "text-emerald-400" },
  GIFT_SENT: { label: "Cadeau envoyé", icon: Gift, color: "text-rose-400" },
  GIFT_RECEIVED: { label: "Cadeau reçu", icon: Gift, color: "text-emerald-400" },
  COLLABORATION: { label: "Collaboration", icon: Users, color: "text-purple-400" },
};

export default function ManasHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>("all");

  const limit = 20;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchHistory();
    fetchBalance();
  }, [page, filter]);

  const fetchBalance = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/manas/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error("Erreur récupération solde:", error);
    }
  };

  const fetchHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const url = filter === "all"
        ? `${API_URL}/manas/history?page=${page}&limit=${limit}`
        : `${API_URL}/manas/history?page=${page}&limit=${limit}&type=${filter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Erreur lors du chargement de l'historique");
      }

      const data = await res.json();
      setTransactions(data.transactions);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const transactionTypes = Object.keys(TRANSACTION_LABELS);

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
            <Coins className="w-5 h-5 text-blue-400" />
            Historique MANAS
          </span>
          <span className="text-sm text-zinc-500">{total} transactions</span>
        </div>
      </header>

      <div className="h-20 md:h-28 w-full bg-gradient-to-r from-zinc-950 via-blue-950/30 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_50%)]" />
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 -mt-6">

        <div className="bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-500/20 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-medium">Solde actuel</p>
              <p className="text-3xl font-extrabold text-white flex items-center gap-2">
                <Coins className="w-7 h-7 text-blue-400" />
                {balance} MANAS
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-400 font-medium">Total transactions</p>
              <p className="text-lg font-bold text-white">{total}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800/60"
              }`}
            >
              Tous
            </button>
            {transactionTypes.map((type) => {
              const info = TRANSACTION_LABELS[type];
              if (!info) return null;
              const Icon = info.icon;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                    filter === type
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800/60"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <History className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Aucune transaction</h3>
            <p className="text-zinc-400 text-sm max-w-sm">
              Vous n'avez pas encore d'historique de MANAS. Commencez à lire et interagir pour gagner des MANAS !
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => {
              const info = TRANSACTION_LABELS[transaction.type];
              const Icon = info?.icon || Coins;
              const color = info?.color || "text-zinc-400";
              const isPositive = transaction.amount > 0;
              const isNegative = transaction.amount < 0;

              return (
                <div
                  key={transaction.id}
                  className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {info?.label || transaction.type}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">{transaction.description}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(transaction.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className={`text-right flex-shrink-0 ${isPositive ? "text-emerald-400" : isNegative ? "text-rose-400" : "text-zinc-400"}`}>
                          <p className="text-sm font-bold">
                            {isPositive ? "+" : ""}{transaction.amount} MANAS
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              Précédent
            </button>
            <span className="text-sm text-zinc-500">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              Suivant
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/profile"
            className="text-xs text-zinc-500 hover:text-blue-400 transition-colors"
          >
            ← Retour au profil
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
