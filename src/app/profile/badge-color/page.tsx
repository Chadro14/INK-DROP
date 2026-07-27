"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Palette } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Color = {
  name: string;
  value: string;
};

export default function BadgeColorPage() {
  const router = useRouter();
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("gold");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isCertified, setIsCertified] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // 1. Récupérer les couleurs disponibles
        const colorsRes = await fetch(`${API_URL}/certification/colors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const colorsData = await colorsRes.json();
        setColors(colorsData);

        // 2. Récupérer le statut de certification
        const statusRes = await fetch(`${API_URL}/certification/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statusData = await statusRes.json();
        setIsCertified(statusData.isCertified);
        setSelectedColor(statusData.badgeColor || "gold");
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSelectColor = async (colorName: string) => {
    if (!isCertified) {
      setMessage("❌ Vous devez être certifié pour changer la couleur du badge");
      return;
    }

    setSaving(true);
    setMessage("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/certification/badge-color`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ badgeColor: colorName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors du changement de couleur");
      }

      setSelectedColor(colorName);
      setMessage("✅ Couleur du badge mise à jour !");
    } catch (err: any) {
      setMessage(err.message);
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
    <div className="flex flex-col min-h-screen bg-white pb-20">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/profile" className="text-gray-600 hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-lg font-bold text-black">Couleur du badge</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">

        {/* État de certification */}
        <div className={`p-4 rounded-lg mb-6 text-center ${isCertified ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
          <p className="text-sm font-medium">
            {isCertified ? (
              <span className="text-green-700">✅ Vous êtes certifié !</span>
            ) : (
              <span className="text-gray-500">❌ Vous n'êtes pas encore certifié</span>
            )}
          </p>
          {!isCertified && (
            <Link href="/certification" className="text-sm text-black underline mt-1 inline-block">
              Voir les conditions de certification
            </Link>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            {message}
          </div>
        )}

        {/* Couleurs */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => handleSelectColor(color.name)}
              disabled={!isCertified || saving}
              className={`
                relative aspect-square rounded-lg border-2 transition-all
                ${selectedColor === color.name ? 'border-black ring-2 ring-black ring-offset-2' : 'border-gray-200 hover:border-gray-400'}
                ${!isCertified ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{
                background: color.value,
              }}
              title={color.name}
            >
              {selectedColor === color.name && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              )}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          {isCertified ? "Cliquez sur une couleur pour changer votre badge" : "Certifiez-vous pour personnaliser votre badge"}
        </p>
      </main>
    </div>
  );
}