"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, BadgeCheck, Check } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";

const API_URL = "https://ink-backend.vercel.app";

// 10 COULEURS CLASSIQUES / NORMALES
const NORMAL_COLORS = [
  { name: "Noir", hex: "#000000" },
  { name: "Bleu", hex: "#2563EB" },
  { name: "Rouge", hex: "#DC2626" },
  { name: "Vert", hex: "#16A34A" },
  { name: "Jaune", hex: "#CA8A04" },
  { name: "Violet", hex: "#9333EA" },
  { name: "Orange", hex: "#EA580C" },
  { name: "Rose", hex: "#DB2777" },
  { name: "Cyan", hex: "#0891B2" },
  { name: "Gris Foncé", hex: "#4B5563" },
];

type UserProfile = {
  id: string;
  username: string;
  isCertified: boolean;
  avatarColor: string | null; // Couleur utilisée pour le badge
};

export default function BadgeColorPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#2563EB");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          if (data.avatarColor) {
            setSelectedColor(data.avatarColor);
          }
        }
      } catch (err) {
        console.error("Erreur lors de la recuperation du profil", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSaveColor = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatarColor: selectedColor }),
      });

      if (res.ok) {
        alert("Couleur du badge enregistree !");
        router.push("/profile");
      } else {
        alert("Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      alert("Erreur reseau.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-white text-black">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <span className="text-base font-bold">Couleur de la Certification</span>
          <div className="w-16"></div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 pt-8 space-y-8">
        
        {/* APERÇU DU BADGE */}
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Aperçu du badge</p>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">@{profile?.username}</span>
            <BadgeCheck 
              className="w-7 h-7 shrink-0 transition-colors duration-200"
              fill={selectedColor}
              color="white"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* GRILLE DES 10 COULEURS */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-700">Choisir une couleur classique :</h2>
          
          <div className="grid grid-cols-5 gap-3">
            {NORMAL_COLORS.map((color) => (
              <button
                key={color.hex}
                onClick={() => setSelectedColor(color.hex)}
                className="group relative aspect-square rounded-xl flex items-center justify-center border border-black/10 transition-transform active:scale-95"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {selectedColor.toLowerCase() === color.hex.toLowerCase() && (
                  <Check className="w-6 h-6 text-white drop-shadow-sm" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* BOUTON D'ENREGISTREMENT */}
        <button
          onClick={handleSaveColor}
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? "Enregistrement..." : "Appliquer la couleur"}
        </button>

      </main>

      <BottomNav />
    </div>
  );
}
