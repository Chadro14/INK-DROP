"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  BookOpen, 
  Users, 
  Heart, 
  Settings, 
  LogOut,
  Star,
  Edit,
  Eye,
  Mail
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      alert(`Token: ${token ? "EXISTE ✅" : "MANQUANT ❌"}`);

      if (!token) {
        setError("Vous n'êtes pas connecté");
        setLoading(false);
        router.push("/login");
        return;
      }

      try {
        alert(`🔵 Envoi requête vers /users/me`);
        alert(`🔑 Token: ${token.substring(0, 30)}...`);

        const res = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert(`🟢 Status: ${res.status}`);

        // 🔥 Lire la réponse brute
        const text = await res.text();
        alert(`📦 Réponse brute: ${text.substring(0, 100)}...`);

        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${text}`);
        }

        const data = JSON.parse(text);
        alert(`✅ Profil chargé: ${data.username}`);
        setProfile(data);
      } catch (err: any) {
        alert(`❌ ERREUR: ${err.message}`);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // ... le reste du code (affichage)
}