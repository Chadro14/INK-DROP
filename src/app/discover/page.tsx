"use client";

import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Search, Filter } from "lucide-react";

export default function DiscoverPage() {
  return (
    <div className="flex flex-col min-h-screen pb-20 bg-ink-bg">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-ink-bg/80 backdrop-blur-sm border-b border-ink-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold text-sm">
              I
            </div>
            <span className="text-lg font-bold">
              INK<span className="text-accent">DROP</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <button className="text-ink-muted hover:text-ink-text transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <button className="text-ink-muted hover:text-ink-text transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENU */}
      <main className="flex-1 px-4 py-8">
        <h1 className="text-xl font-bold mb-4">Découvrir</h1>
        <p className="text-ink-muted">Page en construction. Les mangas apparaîtront ici.</p>
      </main>

      {/* BOTTOM NAV */}
      <BottomNav />
    </div>
  );
}