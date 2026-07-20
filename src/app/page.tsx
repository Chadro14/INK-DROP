'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Wallet, 
  Users, 
  Film,
  Award,
  Globe
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* ===== HERO ===== */}
      <section className="relative py-20 md:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-6 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            Beta ouverte — Rejoignez-nous
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            Lis. <span className="text-accent">Crée.</span> Inspire.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            La plateforme manga où les créateurs du monde entier partagent leurs histoires et sont rémunérés équitablement.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-accent to-accent-dark hover:shadow-lg hover:shadow-accent/25 transition-all">
              <Link href="/discover">Commencer à lire</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/creator/upload">Publier mon manga</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== TRENDING ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-accent" />
              Tendance cette semaine
            </h2>
            <Link href="/discover" className="text-accent hover:underline text-sm font-medium">
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:border-accent transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[2/3] bg-gradient-to-br from-accent/20 to-accent-dark/20 flex items-center justify-center text-4xl">
                  <span className="opacity-50">📖</span>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate group-hover:text-accent transition-colors">
                    Manga {i}
                  </h3>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium">
                      Action
                    </span>
                    <span>❤️ {Math.floor(Math.random() * 10 + 1)}k</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Pourquoi <span className="text-accent">INKDROP</span> ?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 text-center hover:border-accent transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Paiements rapides</h3>
              <p className="text-muted-foreground text-sm">
                Recevez vos revenus instantanément, partout dans le monde.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 text-center hover:border-accent transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">70% pour les créateurs</h3>
              <p className="text-muted-foreground text-sm">
                La plus grande part des revenus revient directement aux artistes.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 text-center hover:border-accent transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Film className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">InkStream</h3>
              <p className="text-muted-foreground text-sm">
                Regardez des animes et soutenez vos créateurs préférés.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-accent">12k+</p>
              <p className="text-muted-foreground text-sm">Mangas publiés</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">3k+</p>
              <p className="text-muted-foreground text-sm">Créateurs actifs</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">1.8M</p>
              <p className="text-muted-foreground text-sm">Pages lues</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">🌍</p>
              <p className="text-muted-foreground text-sm">Pays représentés</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}