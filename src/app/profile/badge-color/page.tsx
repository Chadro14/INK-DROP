"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type ColorOption = {
  id: string;
  name?: string;
  value: string;
};

type NotificationMessage = {
  text: string;
  isError: boolean;
};

export default function BadgeColorPage() {
  const router = useRouter();
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [isCertified, setIsCertified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<NotificationMessage | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [colorsRes, profileRes] = await Promise.all([
          fetch(`${API_URL}/users/badge-colors/list`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (colorsRes.ok) {
          const data = await colorsRes.json();
          const list = data.colors || data.freeColors || (Array.isArray(data) ? data : []);
          setColors(list);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setIsCertified(profileData.isCertified || false);
          setSelectedColor(profileData.badgeColor || profileData.avatarColor || "");
        }
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSelectColor = async (colorValue: string) => {
    if (!isCertified) {
      setMessage({
        text: "Vous devez être certifié pour changer la couleur du badge.",
        isError: true,
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/users/badge-color`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ badgeColor: colorValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors du changement de couleur.");
      }

      setSelectedColor(colorValue);
      setMessage({
        text: "Couleur du badge mise à jour avec succès.",
        isError: false,
      });
    } catch (err: any) {
      setMessage({
        text: err.message,
        isError: true,
      });
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
        {/* Statut de certification */}
        <div className={`p-4 rounded-xl mb-6 text-center border ${isCertified ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
          <p className="text-sm font-medium">
            {isCertified ? "Vous êtes certifié." : "Vous n'êtes pas encore certifié."}
          </p>
        </div>

        {/* Message de notification */}
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${!message.isError ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {/* SELECTION DE COULEUR */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">Choisissez une couleur</h2>
          <div className="grid grid-cols-4 gap-3">
            {colors.map((color: any) => {
              const colorValue = typeof color === 'string' ? color : color.value || color.id || color;
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
      </main>
    </div>
  );
}
