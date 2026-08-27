"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, User, CheckCircle, AlertCircle } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function QRRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [error, setError] = useState("");

  const userId = params.userId as string;

  useEffect(() => {
    const handleScan = async () => {
      try {
        // 1. Récupérer les infos de l'utilisateur
        const userRes = await fetch(`${API_URL}/users/${userId}`);
        if (!userRes.ok) {
          throw new Error("Utilisateur non trouvé");
        }
        const userData = await userRes.json();
        setUser(userData);

        // 2. Enregistrer le scan
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        await fetch(`${API_URL}/qr/scan/${userId}`, {
          method: "POST",
          headers,
        });

        // 3. Rediriger vers le profil après 2 secondes
        setTimeout(() => {
          router.push(`/profile/${userId}`);
        }, 2000);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    handleScan();
  }, [userId, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400/40 mx-auto mb-4" />
          <h2 className="text-white font-bold text-lg">QR invalide</h2>
          <p className="text-white/40 text-sm mt-2">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition-colors"
          >
            Retourner à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black px-4">
      <div className="text-center">
        {loading ? (
          <>
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <h2 className="text-white font-bold text-lg">Chargement...</h2>
            <p className="text-white/40 text-sm mt-2">Vérification du QR code</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-white font-bold text-lg">Scan réussi !</h2>
            <p className="text-white/40 text-sm mt-2">
              Vous allez être redirigé vers le profil de{" "}
              <span className="text-white font-medium">@{user?.username}</span>
            </p>
            <div className="mt-4 w-16 h-1 bg-blue-500/30 rounded-full mx-auto animate-pulse" />
          </>
        )}
      </div>
    </div>
  );
}
