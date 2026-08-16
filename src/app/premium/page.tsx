"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { 
  ArrowLeft, 
  Check, 
  Crown, 
  Sparkles, 
  Zap, 
  Shield, 
  Users, 
  MessageCircle, 
  Globe,
  BadgeCheck,
  Star,
  Award,
  Gift,
  Clock,
  Smartphone,
  Mic,
  Video,
  Calendar,
  Bell,
  Lock,
  Unlock,
  Heart
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Plan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  badge?: string;
  color: string;
};

export default function PremiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch(() => {});
    }
  }, []);

  // ============================================
  // PLANS PREMIUM
  // ============================================
  const plans: Plan[] = [
    {
      id: "standard",
      name: "Standard",
      price: 3,
      currency: "$",
      color: "from-blue-500 to-blue-600",
      icon: <Zap className="w-6 h-6" />,
      features: [
        "Sans publicité",
        "Accès illimité à tous les chapitres",
        "Badge Premium sur votre profil",
        "1 appareil",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: 5,
      currency: "$",
      color: "from-purple-500 to-purple-600",
      icon: <Crown className="w-6 h-6" />,
      popular: true,
      features: [
        "Sans publicité",
        "Accès illimité à tous les chapitres",
        "Accès anticipé (1 jour)",
        "Badge Pro personnalisable",
        "2 appareils",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 7,
      currency: "$",
      color: "from-amber-500 to-amber-600",
      icon: <Star className="w-6 h-6" />,
      features: [
        "Sans publicité",
        "Accès illimité à tous les chapitres",
        "Accès anticipé (2 jours)",
        "Badge Premium personnalisable",
        "Badge Certifié",
        "Traduction XELIRA en temps réel",
        "Rencontres virtuelles avec les créateurs",
        "Contenu exclusif",
        "Support prioritaire",
        "50 MANAS bonus / mois",
        "3 appareils",
      ],
    },
  ];

  // ============================================
  // REDIRECTION VERS LE PAIEMENT
  // ============================================
  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/premium");
      return;
    }

    setSelectedPlan(planId);
    router.push(`/payment?plan=${planId}`);
  };

  if (loading) {
    return <Loader message="Chargement des offres" />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-amber-500 selection:text-black">

      {/* ===== HEADER ===== */}
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
            <Crown className="w-5 h-5 text-amber-400" />
            INKDROP Premium
          </span>
          <div className="w-9" />
        </div>
      </header>

      {/* ===== BANNIÈRE ===== */}
      <div className="relative h-48 md:h-56 w-full bg-gradient-to-r from-zinc-950 via-amber-950/30 to-zinc-950 border-b border-zinc-800/40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.1),transparent_50%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Passez à la vitesse supérieure
            </h1>
          </div>
          <p className="text-zinc-400 text-sm md:text-base max-w-md">
            Profitez de l'expérience INKDROP sans limites
          </p>
        </div>
      </div>

      {/* ===== PLANS ===== */}
      <main className="max-w-6xl mx-auto w-full px-4 py-8 flex-1">
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">

          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-zinc-900/40 border rounded-2xl p-6 transition-all hover:border-zinc-600 flex flex-col ${
                plan.popular
                  ? "border-amber-500/50 shadow-lg shadow-amber-900/20"
                  : "border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              {/* POPULAIRE */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold">
                  ⭐ Le plus populaire
                </div>
              )}

              {/* HEADER */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${plan.color} text-white`}>
                  {plan.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-2xl font-extrabold text-white">
                    {plan.price}{plan.currency}
                    <span className="text-sm font-normal text-zinc-400">/mois</span>
                  </p>
                </div>
              </div>

              {/* FEATURES */}
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* BOUTON */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full mt-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                  plan.popular
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-amber-900/30"
                    : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                }`}
              >
                {isAuthenticated ? "S'abonner" : "Se connecter"}
              </button>
            </div>
          ))}
        </div>

        {/* ===== SÉCURITÉ ===== */}
        <div className="mt-10 text-center">
          <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Paiement sécurisé
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Orange Money / M-Pesa
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Soutenez vos créateurs
            </span>
          </div>
          <p className="mt-3 text-xs text-zinc-600">
            ✦ XELIRA est là pour vous guider ✦
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
