"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { 
  ArrowLeft, 
  Check, 
  Shield, 
  Smartphone, 
  CreditCard,
  AlertCircle,
  Loader2,
  Lock,
  Heart
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type PlanInfo = {
  name: string;
  price: number;
  currency: string;
  color: string;
};

type Operator = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

export default function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "standard";

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [operator, setOperator] = useState<string>("orange");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const plans: Record<string, PlanInfo> = {
    standard: { name: "Standard", price: 3, currency: "$", color: "from-blue-500 to-blue-600" },
    pro: { name: "Pro", price: 5, currency: "$", color: "from-purple-500 to-purple-600" },
    premium: { name: "Premium", price: 7, currency: "$", color: "from-amber-500 to-amber-600" },
  };

  const plan = plans[planId] || plans.standard;

  const operators: Operator[] = [
    {
      id: "mpesa",
      name: "M-Pesa",
      icon: "https://files.catbox.moe/358zi7.jpg",
      description: "Paiement via M-Pesa",
    },
    {
      id: "orange",
      name: "Orange Money",
      icon: "https://files.catbox.moe/z0vta3.jpg",
      description: "Paiement via Orange Money",
    },
  ];

  // ============================================
  // ✅ INITIER LE PAIEMENT (VRAI)
  // ============================================
  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      setError("Veuillez entrer un numéro de téléphone valide");
      return;
    }

    setError("");
    setProcessing(true);
    setPaymentMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login?redirect=/payment");
        return;
      }

      // ✅ APPEL AU BACKEND AVEC LE VRAI OPÉRATEUR
      const res = await fetch(`${API_URL}/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: planId,
          operator: operator, // ← "orange" ou "mpesa"
          phoneNumber: phoneNumber,
          amount: plan.price,
          currency: "USD",
          type: "PREMIUM",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors du paiement");
      }

      // ✅ GESTION DU PAIEMENT EN ATTENTE
      if (data.status === 'PENDING' || data.status === 'PENDING_MANUAL') {
        setPaymentMessage(data.message || "📱 Veuillez confirmer le paiement sur votre téléphone.");
        setSuccess(true);
        setTimeout(() => {
          router.push("/profile");
        }, 5000);
        return;
      }

      // ✅ PAIEMENT RÉUSSI
      if (data.status === 'SUCCESS' || data.success === true) {
        setPaymentMessage("✅ Paiement réussi !");
        setSuccess(true);
        setTimeout(() => {
          router.push("/profile");
        }, 3000);
        return;
      }

      // ✅ ERREUR
      throw new Error(data.message || "Le paiement a échoué");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      setSuccess(false);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <Loader message="Chargement..." />;
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white px-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {paymentMessage || "Paiement réussi !"}
        </h1>
        <p className="text-zinc-400 text-sm text-center max-w-sm">
          Votre abonnement <strong className="text-amber-400">{plan.name}</strong> est maintenant actif.
          <br />
          Vous allez être redirigé vers votre profil...
        </p>
        <div className="w-16 h-1 bg-emerald-500/50 rounded mx-auto mt-4 animate-pulse" />
      </div>
    );
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
            <CreditCard className="w-5 h-5 text-amber-400" />
            Paiement
          </span>
          <div className="w-9" />
        </div>
      </header>

      {/* ===== CONTENU ===== */}
      <main className="max-w-md mx-auto w-full px-4 py-8 flex-1">

        {/* ===== RÉSUMÉ DE LA COMMANDE ===== */}
        <div className={`bg-gradient-to-br ${plan.color} rounded-2xl p-6 mb-6 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Abonnement</p>
              <h2 className="text-xl font-bold text-white">{plan.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">Prix</p>
              <p className="text-xl font-bold text-white">{plan.price}{plan.currency}/mois</p>
            </div>
          </div>
        </div>

        {/* ===== OPÉRATEUR ===== */}
        <div className="space-y-3 mb-6">
          <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            Choisissez votre opérateur
          </label>
          <div className="grid grid-cols-2 gap-3">
            {operators.map((op) => (
              <button
                key={op.id}
                onClick={() => setOperator(op.id)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  operator === op.id
                    ? `border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-900/20`
                    : `border-zinc-800 hover:border-zinc-700`
                }`}
              >
                <img
                  src={op.icon}
                  alt={op.name}
                  className="h-8 w-auto mx-auto mb-1 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <p className="text-xs font-medium text-zinc-300">{op.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ===== NUMÉRO DE TÉLÉPHONE ===== */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            Numéro de téléphone
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
              +243
            </span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="812345678"
              className="w-full pl-14 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>
          <p className="text-xs text-zinc-500">Exemple: 812345678</p>
        </div>

        {/* ===== ERREUR ===== */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-sm mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ===== BOUTON PAYER ===== */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-base transition-all shadow-lg shadow-amber-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Payer {plan.price}{plan.currency}
            </>
          )}
        </button>

        {/* ===== SÉCURITÉ ===== */}
        <div className="mt-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Paiement sécurisé
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              Chiffré
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Soutenez vos créateurs
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-600">
            ✦ XELIRA veille sur votre sécurité ✦
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
