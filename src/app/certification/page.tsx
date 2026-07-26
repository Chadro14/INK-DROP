"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { 
  Star, 
  CheckCircle, 
  Users, 
  BookOpen, 
  Clock,
  Award,
  ChevronRight,
  Sparkles,
  ArrowLeft
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type CertificationStatus = {
  isCertified: boolean;
  certifiedAt: string | null;
  badgeColor: string;
  conditions: {
    chapters: { current: number; required: number; met: boolean };
    followers: { current: number; required: number; met: boolean };
    age: { current: number; required: number; met: boolean };
  };
  canCertify: boolean;
};

export default function CertificationPage() {
  const router = useRouter();
  const [status, setStatus] = useState<CertificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/certification/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erreur lors du chargement");
        const data = await res.json();
        setStatus(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-4">
        <p className="text-gray-500">{error || "Erreur"}</p>
        <button onClick={() => router.push("/profile")} className="mt-4 px-6 py-2 rounded-lg bg-black text-white">
          Retourner au profil
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </button>
          <span className="text-lg font-bold text-black">Certification</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">

        {/* BADGE */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl border-4 ${status.isCertified ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
            {status.isCertified ? (
              <Star className="w-12 h-12 text-yellow-500 fill-yellow-500" />
            ) : (
              <Star className="w-12 h-12 text-gray-300" />
            )}
          </div>
          <h2 className="text-xl font-bold text-black mt-3">
            {status.isCertified ? "Certifié" : "Non certifié"}
          </h2>
          {status.isCertified && (
            <p className="text-gray-500 text-sm">
              Certifié depuis le {status.certifiedAt ? new Date(status.certifiedAt).toLocaleDateString() : "récemment"}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-2">
            {status.isCertified 
              ? "Félicitations ! Vous êtes un créateur certifié INKDROP." 
              : "Atteignez les conditions ci-dessous pour obtenir la certification"}
          </p>
        </div>

        {/* CONDITIONS */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Conditions requises</h3>

          <div className={`rounded-lg p-4 border ${status.conditions.chapters.met ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className={`w-5 h-5 ${status.conditions.chapters.met ? 'text-green-600' : 'text-gray-600'}`} />
                <div>
                  <p className="text-sm font-medium text-black">Chapitres publiés</p>
                  <p className="text-xs text-gray-400">
                    {status.conditions.chapters.current} / {status.conditions.chapters.required}
                  </p>
                </div>
              </div>
              {status.conditions.chapters.met ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-xs text-gray-400">En cours</span>
              )}
            </div>
          </div>

          <div className={`rounded-lg p-4 border ${status.conditions.followers.met ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className={`w-5 h-5 ${status.conditions.followers.met ? 'text-green-600' : 'text-gray-600'}`} />
                <div>
                  <p className="text-sm font-medium text-black">Abonnés</p>
                  <p className="text-xs text-gray-400">
                    {status.conditions.followers.current} / {status.conditions.followers.required}
                  </p>
                </div>
              </div>
              {status.conditions.followers.met ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-xs text-gray-400">En cours</span>
              )}
            </div>
          </div>

          <div className={`rounded-lg p-4 border ${status.conditions.age.met ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${status.conditions.age.met ? 'text-green-600' : 'text-gray-600'}`} />
                <div>
                  <p className="text-sm font-medium text-black">Ancienneté</p>
                  <p className="text-xs text-gray-400">
                    {status.conditions.age.current} jours / {status.conditions.age.required} jours
                  </p>
                </div>
              </div>
              {status.conditions.age.met ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-xs text-gray-400">En cours</span>
              )}
            </div>
          </div>
        </div>

        {/* STATUT GLOBAL */}
        <div className={`mt-6 p-4 rounded-lg text-center ${status.canCertify ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
          <p className="text-sm font-medium">
            {status.canCertify ? "Vous pouvez demander la certification !" : "Remplissez toutes les conditions"}
          </p>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
