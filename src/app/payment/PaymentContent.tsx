"use client";

import { Suspense } from "react";
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
  Heart,
  Crown,
  Globe
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type PlanInfo = {
  name: string;
  price: number;
  currency: string;
  color: string;
  icon: string;
};

type Operator = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

// ✅ PAYS SUPPORTÉS PAR PAWAPAY
type Country = {
  name: string;
  code: string;
  operators: string[];
};

const countries: Country[] = [
  { name: "République Démocratique du Congo", code: "+243", operators: ["orange", "mpesa"] },
  { name: "Kenya", code: "+254", operators: ["mpesa"] },
  { name: "Ghana", code: "+233", operators: ["mpesa"] },
  { name: "Zambie", code: "+260", operators: ["mpesa"] },
  { name: "Côte d'Ivoire", code: "+225", operators: ["orange"] },
  { name: "Sénégal", code: "+221", operators: ["orange"] },
  { name: "Cameroun", code: "+237", operators: ["orange", "mpesa"] },
  { name: "Bénin", code: "+229", operators: ["orange"] },
  { name: "Burkina Faso", code: "+226", operators: ["orange"] },
  { name: "Gabon", code: "+241", operators: ["orange"] },
  { name: "Mozambique", code: "+258", operators: ["mpesa"] },
  { name: "Niger", code: "+227", operators: ["orange"] },
  { name: "Rwanda", code: "+250", operators: ["mpesa"] },
  { name: "Sierra Leone", code: "+232", operators: ["orange"] },
  { name: "Tanzanie", code: "+255", operators: ["mpesa"] },
  { name: "Ouganda", code: "+256", operators: ["mpesa"] },
  { name: "Malawi", code: "+265", operators: ["mpesa"] },
];

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "standard";

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [operator, setOperator] = useState<string>("orange");
  const [country, setCountry] = useState<string>("République Démocratique du Congo");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const plans: Record<string, PlanInfo> = {
    standard: { 
      name: "Standard", 
      price: 3, 
      currency: "$", 
      color: "from-blue-500 to-blue-600",
      icon: "⚡"
    },
    pro: { 
      name: "Pro", 
      price: 5, 
      currency: "$", 
      color: "from-purple-500 to-purple-600",
      icon: "👑"
    },
    premium: { 
      name: "Premium", 
      price: 7, 
      currency: "$", 
      color: "from-amber-500 to-amber-600",
      icon: "⭐"
    },
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

  // ✅ Récupérer le code pays sélectionné
  const selectedCountry = countries.find(c => c.name === country);
  const countryCode = selectedCountry?.code || "+243";

  // ✅ Filtrer les opérateurs disponibles pour le pays sélectionné
  const availableOperators = operators.filter(op => 
    selectedCountry?.operators.includes(op.id)
  );

  // ✅ Validation du numéro selon l'opérateur
  const validatePhoneNumber = (phone: string, op: string): boolean => {
    const clean = phone.replace(/\D/g, '');
    
    if (clean.length < 7 || clean.length > 15) {
      return false;
    }

    if (op === "mpesa") {
      // M-Pesa : commence par 07, 08, 09, ou 7 (Kenya)
      return /^(07|08|09|7)\d{7,13}$/.test(clean);
    }

    if (op === "orange") {
      // Orange Money : commence par 07, 08, 77, 78, 79
      return /^(07|08|77|78|79)\d{7,13}$/.test(clean);
    }

    return true;
  };

  // ============================================
  // ✅ INITIER LE PAIEMENT
  // ============================================
  const handlePayment = async () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // ✅ Vérifier que le numéro est rempli
    if (!phoneNumber || cleanPhone.length < 7) {
      setError("Veuillez entrer un numéro de téléphone valide");
      return;
    }

    // ✅ Vérifier que le numéro correspond à l'opérateur
    if (!validatePhoneNumber(cleanPhone, operator)) {
      const opName = operator === "mpesa" ? "M-Pesa" : "Orange Money";
      setError(`Le numéro ne correspond pas à ${opName}. Vérifiez votre numéro.`);
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

      // ✅ APPEL AU BACKEND AVEC TOUTES LES INFOS
      const res = await fetch(`${API_URL}/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: plan.price,
          currency: "USD",
          phoneNumber: cleanPhone,
          operator: operator,
          type: "PREMIUM",
          plan: planId === "yearly" ? "yearly" : "monthly",
          country: country,
          description: `Abonnement ${plan.name}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors du paiement");
      }

      // ✅ PAIEMENT RÉUSSI
      if (data.success) {
        setPaymentMessage(`✅ Abonnement ${plan.name} activé !`);
        setSuccess(true);
        setTimeout(() => {
          router.push("/profile");
        }, 3000);
        return;
      }

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white px-4">
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

        {/* ===== PAYS ===== */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            Pays
          </label>
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              // ✅ Réinitialiser l'opérateur si non disponible
              const newCountry = countries.find(c => c.name === e.target.value);
              if (newCountry && !newCountry.operators.includes(operator)) {
                setOperator(newCountry.operators[0] || "orange");
              }
            }}
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 outline-none transition-all appearance-none"
          >
            {countries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* ===== OPÉRATEUR ===== */}
        <div className="space-y-3 mb-6">
          <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            Choisissez votre opérateur
          </label>
          <div className="grid grid-cols-2 gap-3">
            {availableOperators.length > 0 ? (
              availableOperators.map((op) => (
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
              ))
            ) : (
              <p className="text-sm text-zinc-500 col-span-2 text-center py-4">
                Aucun opérateur disponible pour ce pays
              </p>
            )}
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
              {countryCode}
            </span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="812345678"
              className="w-full pl-14 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>
          <p className="text-xs text-zinc-500">
            Exemple: {countryCode} 812345678
          </p>
          {operator && (
            <p className="text-[10px] text-zinc-600">
              {operator === "mpesa" ? "📱 M-Pesa" : "📱 Orange Money"} : Le numéro doit correspondre à l'opérateur sélectionné
            </p>
          )}
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
          disabled={processing || availableOperators.length === 0}
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

// ============================================
// PAGE AVEC SUSPENSE
// ============================================
export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
        <Loader fullScreen={false} size={32} color="#F59E0B" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
