"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Ticket,
  Gift,
  Users,
  Calendar,
  Sparkles,
  ChevronRight,
  Clock,
  Check,
  AlertCircle,
  Plus,
  Minus,
  Zap,
  Star,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type TicketBalance = {
  username: string;
  tickets: number;
};

type TicketTransaction = {
  id: string;
  amount: number;
  type: "EVENT" | "REFERRAL" | "DAILY_REWARD" | "GIFT" | "USED";
  description: string;
  createdAt: string;
};

type TicketEvent = {
  id: string;
  name: string;
  description: string;
  tickets: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const TICKET_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  EVENT: { label: "Événement", icon: <Sparkles className="w-3.5 h-3.5" />, color: "text-purple-400" },
  REFERRAL: { label: "Parrainage", icon: <Users className="w-3.5 h-3.5" />, color: "text-blue-400" },
  DAILY_REWARD: { label: "Récompense", icon: <Star className="w-3.5 h-3.5" />, color: "text-emerald-400" },
  GIFT: { label: "Cadeau", icon: <Gift className="w-3.5 h-3.5" />, color: "text-amber-400" },
  USED: { label: "Utilisé", icon: <Check className="w-3.5 h-3.5" />, color: "text-rose-400" },
};

export default function TicketsPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<TicketBalance | null>(null);
  const [transactions, setTransactions] = useState<TicketTransaction[]>([]);
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [balanceRes, historyRes, eventsRes] = await Promise.all([
          fetch(`${API_URL}/tickets/balance`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/tickets/history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/tickets/events`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (balanceRes.ok) {
          const data = await balanceRes.json();
          setBalance(data);
        }

        if (historyRes.ok) {
          const data = await historyRes.json();
          setTransactions(data.transactions || []);
        }

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          setEvents(data || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const claimEventTicket = async (eventId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setClaiming(true);
    try {
      const res = await fetch(`${API_URL}/tickets/event/${eventId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la réclamation");
      }

      const balanceRes = await fetch(`${API_URL}/tickets/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (balanceRes.ok) {
        const newBalance = await balanceRes.json();
        setBalance(newBalance);
      }

      alert(`Ticket gagné ! ${data.message}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return <Loader message="Chargement de vos tickets" />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link
            href="/profile"
            className="text-white/60 hover:text-white transition-colors flex items-center gap-1.5 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-bold text-white/90">Mes Tickets</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* BANNIÈRE */}
      <div className="h-32 md:h-40 w-full bg-gradient-to-r from-zinc-950 via-blue-950/40 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Ticket className="w-24 h-24 text-blue-500" strokeWidth={1} />
        </div>
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 -mt-14 md:-mt-20 flex flex-col items-center">

        {/* ===== SOLDE ===== */}
        <div className="w-full max-w-md bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm border border-zinc-800/60 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 text-center">
          <p className="text-sm text-zinc-400 font-medium">Votre solde</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <Ticket className="w-8 h-8 text-blue-400" />
            <p className="text-5xl md:text-6xl font-black text-white">
              {balance?.tickets || 0}
            </p>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {balance?.tickets === 0 
              ? "Aucun ticket disponible" 
              : `${balance?.tickets} ticket${balance?.tickets > 1 ? "s" : ""} disponible${balance?.tickets > 1 ? "s" : ""}`
            }
          </p>
        </div>

        {/* ===== COMMENT OBTENIR ===== */}
        <div className="w-full max-w-md mt-6">
          <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" />
            Comment obtenir des tickets ?
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/40">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Événements</p>
                <p className="text-xs text-zinc-500">Participez aux événements INKdrop</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/40">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Parrainage</p>
                <p className="text-xs text-zinc-500">Invitez des amis à s'inscrire</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/40">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Cadeaux</p>
                <p className="text-xs text-zinc-500">Offerts occasionnellement par la plateforme</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== HISTORIQUE ===== */}
        <div className="w-full max-w-md mt-6">
          <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" />
            Historique
          </h3>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">Aucune transaction</p>
            ) : (
              transactions.slice(0, 10).map((tx) => {
                const typeInfo = TICKET_TYPE_LABELS[tx.type] || TICKET_TYPE_LABELS.GIFT;
                const isPositive = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center ${typeInfo.color}`}>
                        {typeInfo.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{typeInfo.label}</p>
                        <p className="text-xs text-zinc-500">{tx.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? <Plus className="w-3 h-3 inline" /> : <Minus className="w-3 h-3 inline" />}
                        {Math.abs(tx.amount)}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ===== ÉVÉNEMENTS ===== */}
        {events.length > 0 && (
          <div className="w-full max-w-md mt-6 mb-8">
            <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4" />
              Événements disponibles
            </h3>
            <div className="space-y-2.5">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-950/30 to-zinc-900/40 rounded-xl border border-purple-500/30"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{event.name}</p>
                    <p className="text-xs text-zinc-400">{event.description}</p>
                    <p className="text-[10px] text-zinc-500">
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => claimEventTicket(event.id)}
                    disabled={claiming}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    +{event.tickets}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== MESSAGE D'INFORMATION ===== */}
        <div className="mt-4 max-w-md text-center">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Un ticket vous permet de débloquer gratuitement un chapitre payant.
            <br />
            Les tickets sont non convertibles en MANAS ou en argent.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1">
              <Ticket className="w-3 h-3 text-blue-400" />
              1 ticket = 1 chapitre
            </span>
            <span className="w-px h-3 bg-zinc-700" />
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Non convertible
            </span>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
