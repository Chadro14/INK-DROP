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
  Lock,
  Heart,
  Calendar,
  TrendingUp,
  Upload,
  Palette,
  Trophy,
  Sparkle
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
  description: string;
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
      description: "L'essentiel pour commencer",
      features: [
        "Notifications automatiques",
        "Accès illimité à tous les chapitres",
        "Sans publicité",
        "Badge Premium basique",
        "Commentaires prioritaires",
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
      description: "Pour les créateurs actifs",
      features: [
        "Notifications automatiques",
        "Accès illimité à tous les chapitres",
        "Sans publicité",
        "Accès anticipé (1 jour)",
        "Badge Pro personnalisable",
        "Commentaires prioritaires",
        "2 appareils",
        "Épinglage de manga (1 semaine)",
        "Statistiques avancées",
        "Planification de publication",
        "Upload en masse",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 7,
      currency: "$",
      color: "from-amber-500 to-amber-600",
      icon: <Star className="w-6 h-6" />,
      description: "L'expérience ultime",
      features: [
        "Notifications automatiques",
        "Accès illimité à tous les chapitres",
        "Sans publicité",
        "Accès anticipé (2 jours)",
        "Badge Premium personnalisable",
        "Commentaires prioritaires",
        "3 appareils",
        "Épinglage de manga (1 semaine)",
        "Statistiques avancées",
        "Planification de publication",
        "Upload en masse",
        "Badges personnalisés pour fans",
        "Concours et événements",
        "Contenu exclusif",
        "Support prioritaire",
        "50 MANAS bonus / mois",
        "Badge Certifié",
        "Traduction XELIRA en temps réel",
        "Rencontres virtuelles avec les créateurs",
      ],
    },
  ];

  // ============================================
  // OPÉRATEURS DE PAIEMENT (SVG)
  // ============================================
  const operators = [
    {
      id: "mpesa",
      name: "M-Pesa",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="30" height="30" rx="7" fill="#E6F7E6" stroke="#00A859" strokeWidth="2"/>
          <path d="M16 8C11.5 8 8 11 8 15C8 19 11.5 22 16 22C20.5 22 24 19 24 15C24 11 20.5 8 16 8Z" fill="#00A859"/>
          <path d="M16 14C15.5 14 15 14.5 15 15V17C15 17.5 15.5 18 16 18C16.5 18 17 17.5 17 17V15C17 14.5 16.5 14 16 14Z" fill="white"/>
          <path d="M18 16H14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="16" cy="15" r="1.5" fill="white"/>
          <path d="M20 12L18 15L16 12L14 15L12 12" stroke="#00A859" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: "orange",
      name: "Orange Money",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="30" height="30" rx="7" fill="#FFF0E6" stroke="#FF6600" strokeWidth="2"/>
          <circle cx="16" cy="16" r="9" fill="#FF6600"/>
          <circle cx="16" cy="16" r="5" fill="white"/>
          <circle cx="16" cy="16" r="2.5" fill="#FF6600"/>
          <path d="M10 10L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M22 10L18 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 22L14 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M22 22L18 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
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
        <div className="flex items-center justify-between max-w-6xl mx-auto">
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
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold flex items-center gap-1">
                  <Sparkle className="w-3 h-3" />
                  Le plus populaire
                </div>
              )}

              {/* HEADER */}
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${plan.color} text-white`}>
                  {plan.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-zinc-400">{plan.description}</p>
                </div>
              </div>

              {/* PRIX */}
              <div className="mb-4">
                <p className="text-3xl font-extrabold text-white">
                  {plan.price}{plan.currency}
                  <span className="text-sm font-normal text-zinc-400">/mois</span>
                </p>
              </div>

              {/* FEATURES */}
              <ul className="space-y-2 flex-1">
                {plan.features.map((feature, index) => {
                  const isNew = [
                    "Épinglage de manga (1 semaine)",
                    "Statistiques avancées",
                    "Planification de publication",
                    "Upload en masse",
                    "Badges personnalisés pour fans",
                    "Concours et événements",
                  ].includes(feature);

                  return (
                    <li key={index} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className={isNew ? "text-amber-300" : ""}>
                        {feature}
                        {isNew && (
                          <span className="ml-1.5 text-[9px] font-bold text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                            NOUVEAU
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
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

        {/* ===== OPÉRATEURS DE PAIEMENT ===== */}
        <div className="mt-10 text-center">
          <p className="text-sm text-zinc-400 mb-4">Paiement sécurisé via</p>
          <div className="flex items-center justify-center gap-6">
            {operators.map((op) => (
              <div key={op.id} className="flex items-center gap-2 text-zinc-400">
                {op.icon}
                <span className="text-xs font-medium">{op.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SÉCURITÉ ET CONFIDENTIALITÉ ===== */}
        <div className="mt-8 pt-6 border-t border-zinc-800/60">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Paiement sécurisé
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              Confidentialité garantie
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Soutenez vos dessinateurs
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkle className="w-3.5 h-3.5 text-amber-400" />
              XELIRA vous guide
            </span>
          </div>
          <p className="mt-3 text-[10px] text-zinc-600 text-center">
            ✦ Vos données sont sécurisées grace à la nouvelle fonctionnalité xelira exo 4.5. ✦
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
