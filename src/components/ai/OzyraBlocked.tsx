"use client";

import Link from "next/link";
import { Crown, Lock, ArrowRight, Sparkles } from "lucide-react";

export function OzyraBlocked() {
  return (
    <div className="w-full bg-background/80 backdrop-blur-xl border-t border-border/40 px-4 py-5"
      style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-background to-purple-500/10 p-5">
          {/* Halo décoratif */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
              <Lock className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <h3 className="text-sm font-extrabold text-foreground">
                  OZYRA OPLEX 2.5 — Accès réservé
                </h3>
              </div>

              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Passez à un compte{" "}
                <strong className="text-foreground">Créateur</strong> et
                bénéficiez de la nouvelle version d'
                <strong className="text-amber-600 dark:text-amber-400">
                  OZYRA OPLEX 2.5
                </strong>
                .
              </p>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Link
                  href="/premium"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-500/30 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Voir les offres
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <span className="text-[10px] text-muted-foreground">
                  Pro (5 USD / 2 mois) • Premium (7 USD / 3 mois)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
