"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function CreatorRequestStatusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | null>(null);
  const [request, setRequest] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/creator-request/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 404) {
            setStatus(null);
            setError("Aucune demande trouvée");
          } else {
            throw new Error("Erreur de chargement");
          }
        } else {
          const data = await res.json();
          setStatus(data.status);
          setRequest(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4 text-center text-white">
        <div className="w-16 h-16 rounded-full bg-rose-950/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Aucune demande</h2>
        <p className="text-zinc-400 max-w-md">
          {error || "Vous n'avez pas encore fait de demande de créateur."}
        </p>
        <Link
          href="/creator-request"
          className="mt-6 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          Faire une demande
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <Link href="/profile" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-white tracking-tight">
            Statut de la demande
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 md:p-8 text-center">
          {/* Statut */}
          <div className="flex justify-center mb-4">
            {status === "PENDING" && (
              <div className="w-20 h-20 rounded-full bg-amber-950/40 border-2 border-amber-500/40 flex items-center justify-center">
                <Clock className="w-10 h-10 text-amber-400" />
              </div>
            )}
            {status === "APPROVED" && (
              <div className="w-20 h-20 rounded-full bg-emerald-950/40 border-2 border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
            )}
            {status === "REJECTED" && (
              <div className="w-20 h-20 rounded-full bg-rose-950/40 border-2 border-rose-500/40 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-rose-400" />
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            {status === "PENDING" && "Demande en cours d'examen"}
            {status === "APPROVED" && "Demande approuvée ! 🎉"}
            {status === "REJECTED" && "Demande refusée"}
          </h1>

          <p className="text-zinc-400 text-sm mb-4">
            {status === "PENDING" && "Votre demande de créateur est en cours d'examen par l'équipe INKDROP."}
            {status === "APPROVED" && "Félicitations ! Vous êtes maintenant un créateur sur INKDROP."}
            {status === "REJECTED" && request?.reviewNotes && `Raison : ${request.reviewNotes}`}
          </p>

          {status === "PENDING" && (
            <p className="text-zinc-500 text-xs">Date de la demande : {new Date(request?.createdAt).toLocaleDateString()}</p>
          )}

          {status === "REJECTED" && (
            <Link
              href="/creator-request"
              className="mt-4 inline-block px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
            >
              Faire une nouvelle demande
            </Link>
          )}

          {status === "APPROVED" && (
            <Link
              href="/profile"
              className="mt-4 inline-block px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all"
            >
              Voir mon profil
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
