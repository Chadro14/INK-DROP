"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, User, CheckCircle, AlertCircle, Crown, BadgeCheck } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type UserData = {
  id: string;
  username: string;
  avatarUrl: string | null;
  isCertified: boolean;
  premiumActive: boolean;
};

export default function QRRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState("");

  const userId = params.userId as string;

  useEffect(() => {
    const handleScan = async () => {
      try {
        // 1. Récupérer les infos de l'utilisateur
        const userRes = await fetch(`${API_URL}/qr/${userId}`);
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

        // 3. ✅ REDIRIGER VERS /creator/[username] (profil public)
        setTimeout(() => {
          router.push(`/creator/${userData.username}`);
        }, 1500);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    handleScan();
  }, [userId, router]);

  // ... reste du code (affichage)
}
