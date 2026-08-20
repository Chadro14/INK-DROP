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
  Lock, 
  Heart,
  Sparkle,
  Star,
  Calendar
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
  color: string;
  description: string;
};

export default function PremiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [premiumActive, setPremiumActive] = useState(false);
  const [premiumExpires, setPremiumExpires] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("READER");

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
  // CHARGEMENT DES DONNÉES
  // ============================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetchUserStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [userRes, premiumRes] = await Promise.all([
        fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/users/premium-status`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUserRole(userData.role || "READER");
      }

      if (premiumRes.ok) {
        const premiumData = await premiumRes.json();
        setPremiumActive(premiumData.premiumActive || false);
        if (premiumData.premiumPlan) {
          setUserPlan(premiumData.premiumPlan.toLowerCase());
        }
        if (premiumData.premiumExpires) {
          setPremiumExpires(premiumData.premiumExpires);
        }
      }
    } catch (error) {
      console.error("Erreur chargement statut premium:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/premium");
      return;
    }
    router.push(`/payment?plan=${planId}`);
  };

  const handleManage = () => {
    router.push("/profile");
  };

  if (loading) {
    return <Loader message="Chargement des offres" />;
  }

  const isAdmin = userRole === "ADMIN";

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

          {plans.map((plan) => {
            const isCurrentPlan = userPlan === plan.id && premiumActive;
            const isAdminFree = isAdmin;

            return (
              <div
                key={plan.id}
                className={`relative bg-zinc-900/40 border rounded-2xl p-6 transition-all hover:border-zinc-600 flex flex-col ${
                  plan.popular
                    ? "border-amber-500/50 shadow-lg shadow-amber-900/20"
                    : "border-zinc-800/80 hover:border-zinc-700"
                } ${isCurrentPlan ? "border-emerald-500/50 shadow-lg shadow-emerald-900/20" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold flex items-center gap-1">
                    <Sparkle className="w-3 h-3" />
                    Le plus populaire
                  </div>
                )}

                {/* ✅ BADGE ACTUEL */}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-1/2 translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Actuel
                  </div>
                )}

                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${plan.color} text-white`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-zinc-400">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-3xl font-extrabold text-white">
                    {isAdminFree ? "Gratuit" : `${plan.price}${plan.currency}`}
                    <span className="text-sm font-normal text-zinc-400">
                      {isAdminFree ? " (Admin)" : "/mois"}
                    </span>
                  </p>
                  {premiumExpires && isCurrentPlan && (
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      Valable jusqu'au {new Date(premiumExpires).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

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

                <button
                  onClick={() => isCurrentPlan ? handleManage() : handleSubscribe(plan.id)}
                  className={`w-full mt-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                    isCurrentPlan
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30"
                      : plan.popular
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-amber-900/30"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                  }`}
                >
                  {isCurrentPlan ? "✅ Gérer mon abonnement" : (isAuthenticated ? "S'abonner" : "Se connecter")}
                </button>
              </div>
            );
          })}
        </div>

        {/* ===== OPÉRATEURS DE PAIEMENT ===== */}
        <div className="mt-10 text-center">
          <p className="text-sm text-zinc-400 mb-4">Paiement sécurisé via</p>
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-1">
              <img 
                src="https://files.catbox.moe/358zi7.jpg" 
                alt="M-Pesa" 
                className="h-8 w-auto object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" rx="8" fill="%232E7D32"/%3E%3Ctext x="20" y="24" text-anchor="middle" fill="white" font-size="12" font-weight="bold"%3EMPESA%3C/text%3E%3C/svg%3E';
                }}
              />
              <span className="text-xs font-medium text-zinc-400">M-Pesa</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <img 
                src="https://files.catbox.moe/z0vta3.jpg" 
                alt="Orange Money" 
                className="h-8 w-auto object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" rx="8" fill="%23E65100"/%3E%3Ctext x="20" y="24" text-anchor="middle" fill="white" font-size="10" font-weight="bold"%3EORANGE%3C/text%3E%3C/svg%3E';
                }}
              />
              <span className="text-xs font-medium text-zinc-400">Orange Money</span>
            </div>
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
            ✦ Vos données sont sécurisées grâce à Xelira Upclose 4.5 ✦
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
