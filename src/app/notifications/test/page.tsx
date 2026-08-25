"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, CheckCircle } from "lucide-react";

export default function NotificationsTestPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <span className="text-base font-bold tracking-tight text-white/90 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Test Notifications
          </span>
          <div className="w-9" />
        </div>
      </header>

      {/* CONTENU */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Page de test des notifications
          </h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Cette page est opérationnelle. La route <code className="bg-zinc-800 px-2 py-0.5 rounded text-blue-400 text-xs">/notifications/test</code> existe maintenant.
          </p>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/notifications"
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              Voir mes notifications
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold transition-all"
            >
              Recharger
            </button>
          </div>
        </div>

        {/* INFORMATIONS DE DEBUG */}
        <div className="mt-6 bg-zinc-900/20 border border-zinc-800/40 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Informations
          </h3>
          <ul className="text-xs text-zinc-400 space-y-1">
            <li>🔹 Page : <span className="text-white">/notifications/test</span></li>
            <li>🔹 Statut : <span className="text-emerald-400">✅ Opérationnelle</span></li>
            <li>🔹 Créée le : <span className="text-white">{new Date().toLocaleDateString('fr-FR')}</span></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
