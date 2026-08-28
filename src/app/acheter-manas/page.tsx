"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Coins,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
  Shield,
  Smartphone,
  Zap,
  Gift,
  Crown,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type ManasPack = {
  id: string;
  name: string;
  price: number;
  manas: number;
  popular?: boolean;
  icon: React.ReactNode;
  description: string;
  color: string;
  badge?: string;
};

const MANAS_PACKS: ManasPack[] = [
  {
    id: "manas_30",
    name: "Mini pack",
    price: 0.30,
    manas: 30,
    icon: <Coins className="w-5 h-5" />,
    description: "Pour débloquer un petit chapitre",
    color: "from-blue-500/20 to-blue-600/20",
  },
  {
    id: "manas_50",
    name: "Pack starter",
    price: 0.50,
    manas: 50,
    icon: <Coins className="w-5 h-5" />,
    description: "Idéal pour un chapitre",
    color: "from-blue-400/20 to-indigo-500/20",
    badge: "Populaire",
  },
  {
    id: "manas_100",
    name: "Pack moyen",
    price: 1.00,
    manas: 100,
    popular: true,
    icon: <Zap className="w-5 h-5" />,
    description: "Pour plusieurs chapitres",
    color: "from-indigo-500/20 to-purple-500/20",
    badge: "Meilleur rapport",
  },
  {
    id: "manas_200",
    name: "Grand pack",
    price: 2.00,
    manas: 200,
    icon: <Sparkles className="w-5 h-5" />,
    description: "Pour les lecteurs réguliers",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "manas_500",
    name: "Pack premium",
    price: 5.00,
    manas: 500,
    icon: <Gift className="w-5 h-5" />,
    description: "Pour les passionnés",
    color: "from-pink-500/20 to-rose-500/20",
    badge: "Premium",
  },
];

export default function ManasPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [operator, setOperator] = useState<"ORANGE" | "MPESA">("ORANGE");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  const redirectParam = searchParams.get("redirect");

  // ============================================
  // RÉCUPÉRER LE SOLDE DE L'UTILISATEUR
  // ============================================
  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/manas/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserBalance(data.balance);
        }
      } catch (error) {
        console.error("❌ Erreur récupération solde:", error);
      }
    };

    fetchBalance();
  }, []);

  // ============================================
  // SÉLECTIONNER UN PACK
  // ============================================
  const handleSelectPack = (packId: string) => {
    setSelectedPack(packId);
    setError("");
  };

  // ============================================
  // PAYER AVEC PAWAPAY (MOBILE MONEY)
  // ============================================
  const handlePayment = async () => {
    if (!selectedPack) {
      setError("Veuillez sélectionner un pack");
      return;
    }

    const pack = MANAS_PACKS.find((p) => p.id === selectedPack);
    if (!pack) return;

    if (!phoneNumber || phoneNumber.length < 8) {
      setError("Veuillez entrer un numéro de téléphone valide");
      return;
    }

    setProcessing(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/payments/manas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: pack.price,
          currency: "USD",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors du paiement");
      }

      setSuccess(true);
      setUserBalance(data.newBalance);

      setTimeout(() => {
        if (redirectParam) {
          router.push(redirectParam);
        } else {
          router.push("/profile");
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erreur lors du paiement");
    } finally {
      setProcessing(false);
    }
  };

  const selectedPackData = MANAS_PACKS.find((p) => p.id === selectedPack);

  if (loading) {
    return <Loader message="Chargement..." />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link
            href={redirectParam || "/profile"}
            className="text-white/60 hover:text-white transition-colors flex items-center gap-1.5 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-bold text-white/90">Acheter des MANAS</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* BANNIÈRE */}
      <div className="h-32 md:h-40 w-full bg-gradient-to-r from-zinc-950 via-blue-950/40 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Coins className="w-24 h-24 text-blue-500" strokeWidth={1} />
        </div>
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 -mt-14 md:-mt-20 flex flex-col items-center">

        {/* SOLDE ACTUEL */}
        <div className="w-full max-w-md bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm border border-zinc-800/60 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 text-center mb-6">
          <p className="text-sm text-zinc-400 font-medium">Votre solde actuel</p>
          <p className="text-4xl md:text-5xl font-black text-white mt-2 flex items-center justify-center gap-3">
            {userBalance !== null ? userBalance : "..."}
            <span className="text-2xl text-blue-400">MANAS</span>
          </p>
          <p className="text-xs text-zinc-500 mt-1">1 MANAS = 0.01 USD</p>
        </div>

        {/* PACKS */}
        <div className="w-full max-w-md space-y-3">
          <p className="text-sm text-zinc-400 font-medium text-center mb-2">
            Choisissez votre pack
          </p>

          {MANAS_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => handleSelectPack(pack.id)}
              className={`w-full p-4 rounded-2xl border transition-all text-left group ${
                selectedPack === pack.id
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                  : "border-zinc-800/60 hover:border-zinc-700 bg-zinc-900/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${pack.color}`}>
                    {pack.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      {pack.name}
                      {pack.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          pack.badge === "Premium" 
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : pack.badge === "Meilleur rapport"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}>
                          {pack.badge}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500">{pack.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">${pack.price.toFixed(2)}</p>
                  <p className="text-[10px] text-zinc-500">{pack.manas} MANAS</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* NUMÉRO DE TÉLÉPHONE */}
        <div className="w-full max-w-md mt-6">
          <label className="text-sm font-medium text-zinc-400 block mb-2">
            Numéro de téléphone (Mobile Money)
          </label>
          <div className="flex gap-2">
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value as "ORANGE" | "MPESA")}
              className="px-3 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="ORANGE">Orange Money</option>
              <option value="MPESA">M-Pesa</option>
            </select>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+243 8X XXX XXXX"
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            Entrez votre numéro Orange Money, M-Pesa ou autre
          </p>
        </div>

        {/* ERREUR / SUCCÈS */}
        {error && (
          <div className="w-full max-w-md mt-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="w-full max-w-md mt-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>✅ Paiement réussi ! {selectedPackData?.manas} MANAS ajoutés à votre compte.</span>
          </div>
        )}

        {/* BOUTON PAYER */}
        <button
          onClick={handlePayment}
          disabled={processing || !selectedPack || !phoneNumber}
          className={`w-full max-w-md mt-6 py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
            !selectedPack || !phoneNumber
              ? "bg-zinc-800/50 text-zinc-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/20"
          }`}
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <Coins className="w-5 h-5" />
              Payer {selectedPackData ? `$${selectedPackData.price.toFixed(2)}` : ""}
            </>
          )}
        </button>

        {/* MESSAGE INFORMATIF */}
        <div className="mt-6 max-w-md text-center">
          <p className="text-xs text-zinc-500 leading-relaxed">
            <Shield className="w-3 h-3 inline mr-1 text-blue-400" />
            Paiement sécurisé via PawaPay. Vous recevrez vos MANAS instantanément.
          </p>
          <p className="text-[10px] text-zinc-600 mt-2">
            1 MANAS = 0.01 USD • Achat non remboursable
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              Premium
            </span>
            <span className="w-px h-3 bg-zinc-700" />
            <span className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-blue-400" />
              MANAS
            </span>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
