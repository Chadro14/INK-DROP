"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🔥 API DIRECTE DU BACKEND
      const res = await fetch("https://ink-backend.vercel.app/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Email ou mot de passe incorrect");
      }

      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden bg-ink-bg">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://n.uguu.se/tjiqhbva.jpg')`,
          backgroundColor: '#0A1628',
        }}
      />
      <div className="absolute inset-0 z-0 bg-black/60" />

      <div className="relative z-10 w-full max-w-md bg-ink-bg/80 backdrop-blur-md border border-ink-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="4" />
              <path d="M8 8h8v8H8z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Connexion</h1>
          <p className="text-ink-muted text-sm mt-1">
            Connecte-toi pour accéder à tous les mangas
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-ink-card/80 border border-ink-border text-white placeholder-ink-muted focus:border-accent outline-none transition-colors backdrop-blur-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-ink-muted text-sm font-medium mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full pl-10 pr-12 py-3 rounded-lg bg-ink-card/80 border border-ink-border text-white placeholder-ink-muted focus:border-accent outline-none transition-colors backdrop-blur-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Se connecter <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-ink-muted text-center text-sm mt-6">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-accent hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}