"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type ColorOption = {
  id: string;
  name: string;
  value: string;
  isPremium?: boolean;
};

export default function BadgeColorPage() {
  const router = useRouter();
  const [freeColors, setFreeColors] = useState<ColorOption[]>([]);
  const [premiumColors, setPremiumColors] = useState<ColorOption[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [isCertified, setIsCertified] = useState(false);
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // 1. Récupérer les couleurs depuis l'endpoint validé du backend
        const res = await fetch(`${API_URL}/users/badge-colors/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          setFreeColors(data.freeColors || []);
          setPremiumColors(data.premiumColors || []);
          setIsUserPremium(data.isUserPremium || false);
        }

        // 2. Récupérer le profil utilisateur pour connaître son statut et sa couleur actuelle
        const profileRes = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();

        if (profileRes.ok) {
          setIsCertified(profileData.isCertified || false);
          setSelectedColor(profileData.badgeColor || "");
        }
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSelectColor = async (colorKey: string) => {
    if (!isCertified) {
      setMessage("❌ Vous devez être certifié pour changer la couleur du badge.");
      return;
    }

    setSaving(true);
    setMessage("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/users/badge-color`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ badgeColor: colorKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors du changement de couleur.");
      }

      setSelectedColor(colorKey);
      setMessage("✅ Couleur du badge mise à jour avec succès ! 🔥");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pb-20">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/profile" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-lg font-bold">Couleur du badge</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {/* État de certification */}
        <div className={`p-4 rounded-xl mb-6 text-center border ${isCertified ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
          <p className="text-sm font-medium">
            {isCertified ? "✅ Vous êtes certifié !" : "❌ Vous n'êtes pas encore certifié"}
          </p>
        </div>

        {/* Message de notification */}
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${message.includes('✅') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* 1. COULEURS GRATUITES */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 mb-3">🎨 Couleurs Gratuites (Shonen Vibes)</h2>
          <div className="grid grid-cols-4 gap-3">
            {freeColors.map((color: any) => {
              const colorValue = typeof color === 'string' ? color : color.value || color;
              const isSelected = selectedColor === colorValue;

              return (
                <button
                  key={colorValue}
                  onClick={() => handleSelectColor(colorValue)}
                  disabled={!isCertified || saving}
                  className={`relative h-12 rounded-xl border-2 transition-all flex items-center justify-center ${
                    isSelected ? 'border-white scale-105 ring-2 ring-white/50' : 'border-white/10 hover:border-white/40'
                  } ${!isCertified ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{ backgroundColor: colorValue.startsWith('#') ? colorValue : undefined }}
                >
                  {isSelected && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. COULEURS & EFFETS PREMIUM */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Couleurs & Effets Animés VIP
            </h2>
            {!isUserPremium && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">🔒 Premium requis</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {premiumColors.map((item: any) => {
              const itemKey = typeof item === 'string' ? item : item.id || item.value;
              const isSelected = selectedColor === itemKey;

              return (
                <button
                  key={itemKey}
                  onClick={() => isUserPremium && handleSelectColor(itemKey)}
                  disabled={!isUserPremium || !isCertified || saving}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all text-left flex items-center justify-between ${
                    isSelected 
                      ? 'border-amber-400 bg-amber-400/10 text-amber-300' 
                      : isUserPremium 
                        ? 'border-white/10 hover:border-white/40 bg-white/5 text-white' 
                        : 'border-white/5 opacity-40 cursor-not-allowed bg-black text-gray-500'
                  }`}
                >
                  <span className="truncate capitalize">{itemKey.replace('-', ' ')}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
