"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, BadgeCheck, Sparkles, Check, Loader2 } from "lucide-react";

// 🔴 CORRECTION DU BUG "Failed to fetch" : URL backend directement en dur
const baseUrl = "https://ink-backend.vercel.app";

const PRESET_COLORS = [
  { name: "Or Électrique", value: "#FFD700" },
  { name: "Bleu Électrique", value: "#3B82F6" },
  { name: "Émeraude Glow", value: "#10B981" },
  { name: "Violet Néon", value: "#8B5CF6" },
  { name: "Rose Cyber", value: "#F43F5E" },
  { name: "Rouge Crimson", value: "#EF4444" },
  { name: "Cyan Plasma", value: "#06B6D4" },
  { name: "Ambre Chaud", value: "#F59E0B" },
];

export default function BadgeColorPage() {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Charger la couleur actuelle au chargement de la page
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setFetching(false);
          return;
        }

        const res = await fetch(`${baseUrl}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.avatarColor) {
            setSelectedColor(data.avatarColor);
          }
        }
      } catch (err) {
        console.error("Erreur de chargement du profil :", err);
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, []);

  // Enregistrer la nouvelle couleur
  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vous devez être connecté pour modifier votre badge.");
      }

      const res = await fetch(`${baseUrl}/users/badge-color`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatarColor: selectedColor }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la mise à jour de la couleur.");
      }

      setMessage({ type: "success", text: "Couleur du badge mise à jour avec succès !" });
      
      setTimeout(() => {
        router.push("/profile");
      }, 1200);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Impossible de contacter le serveur." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">
      
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link
            href="/profile"
            className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold">Retour</span>
          </Link>
          <h1 className="text-base font-extrabold text-white">Couleur du Badge</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-6">
        
        {/* ===== APERÇU EN DIRECT ===== */}
        <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl backdrop-blur-md text-center space-y-4 shadow-xl">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" /> Aperçu en direct
          </p>
          
          <div className="flex items-center justify-center p-4 bg-zinc-950 border border-zinc-800/90 rounded-2xl w-full">
            <div className="flex items-center gap-3">
              <BadgeCheck
                className="w-12 h-12 transition-all duration-300 drop-shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                fill={selectedColor}
                color="#09090b"
                strokeWidth={1.5}
              />
              <div className="text-left">
                <p className="text-sm font-extrabold text-white">Badge de certification</p>
                <p className="text-xs font-semibold" style={{ color: selectedColor }}>
                  {PRESET_COLORS.find((c) => c.value === selectedColor)?.name || selectedColor}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== NOTIFICATION ===== */}
        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-bold border transition-all ${
              message.type === "success"
                ? "bg-blue-950/40 border-blue-500/50 text-blue-300"
                : "bg-rose-950/40 border-rose-500/50 text-rose-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ===== SÉLECTION DE COULEURS PRÉDÉFINIES ===== */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Palette de couleurs
          </label>

          {fetching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {PRESET_COLORS.map((color) => {
                const isSelected = selectedColor === color.value;
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? "bg-zinc-900 border-blue-500 ring-2 ring-blue-500/30 scale-105"
                        : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full shadow-inner flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color.value }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-zinc-950 stroke-[3]" />}
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400 mt-2 truncate w-full text-center">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== COULEUR SUR MESURE (HEX) ===== */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/60">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Code couleur personnalisé (HEX)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer overflow-hidden p-1"
            />
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              placeholder="#FFD700"
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* ===== BOUTON VALIDER ===== */}
        <button
          onClick={handleSave}
          disabled={loading || fetching}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            "Enregistrer la couleur"
          )}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
