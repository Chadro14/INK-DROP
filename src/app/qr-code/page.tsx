"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ArrowLeft, Download, Share2, Users, Clock, QrCode } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type QRData = {
  userId: string;
  username: string;
  qrData: string;
  qrImage: string;
  scanCount: number;
};

export default function QRCodePage() {
  const router = useRouter();
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchQR = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/qr/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Erreur lors du chargement du QR");
        }

        const data = await res.json();
        setQrData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQR();
  }, [router]);

  const downloadQR = () => {
    if (!qrData) return;
    const link = document.createElement("a");
    link.download = `qr-${qrData.username}.png`;
    link.href = qrData.qrImage;
    link.click();
  };

  const shareQR = async () => {
    if (!qrData) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Scanner le QR de ${qrData.username}`,
          text: `Scanner ce QR pour voir le profil de ${qrData.username} sur INKDROP !`,
          url: qrData.qrData,
        });
      } else {
        await navigator.clipboard.writeText(qrData.qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (error) {
      console.error("Erreur de partage:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black px-4">
        <p className="text-white/60 text-center">{error || "QR non trouvé"}</p>
        <Link href="/profile" className="mt-4 px-6 py-2 rounded-lg bg-white text-black font-semibold">
          Retourner au profil
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black pb-20">

      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/profile" className="text-white/60 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </Link>
          <span className="text-sm font-medium text-white">Mon QR Code</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6">
          
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-xl p-4">
              <img
                src={qrData.qrImage}
                alt={`QR Code de ${qrData.username}`}
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="text-white font-bold mt-4">@{qrData.username}</p>
            <p className="text-white/40 text-sm">Scanner pour voir le profil</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <Users className="w-5 h-5 text-blue-400 mx-auto" />
              <p className="text-white/40 text-xs mt-1">Scans</p>
              <p className="text-white font-bold">{qrData.scanCount}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-blue-400 mx-auto" />
              <p className="text-white/40 text-xs mt-1">Génére</p>
              <p className="text-white font-bold text-xs">Aujourd'hui</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={downloadQR}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <Download className="w-4 h-4" />
              Télécharger le QR
            </button>
            <button
              onClick={shareQR}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {copied ? "Copié !" : "Partager le QR"}
            </button>
          </div>
        </div>

        <p className="text-white/20 text-xs mt-6 text-center max-w-sm">
          Votre QR code est unique. Partagez-le avec vos amis pour qu'ils puissent
          découvrir votre profil et gagner des points Steam !
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
