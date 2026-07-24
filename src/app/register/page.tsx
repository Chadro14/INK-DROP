"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, User, Lock, Calendar, ArrowRight } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

export default function RegisterPage() {
  const router = useRouter();

  // États du formulaire
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username || `${firstName}${lastName}`,
          email,
          password,
          firstName,
          lastName,
          dateOfBirth,
          gender,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription");
      }

      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden bg-black">

      {/* Arrière-plan avec diaporama */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/70 z-10" />
        <div className="w-full h-full bg-cover bg-center bg-no-repeat animate-fade-in"
          style={{
            backgroundImage: `url('https://files.catbox.moe/1xmjr4.jpg')`,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-white/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">I</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Créer un compte</h1>
          <p className="text-white/50 text-sm mt-1">
            Rejoins la première plateforme manga payée en mobile money
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Prénom & Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/40 outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/40 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Nom d'utilisateur */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1">Nom d'utilisateur</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nom d'utilisateur"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/40 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/40 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Date de naissance & Genre */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Date de naissance</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/40 outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1">Genre</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-white/40 outline-none transition-colors"
                required
              >
                <option value="">Sélectionner</option>
                <option value="M">Homme</option>
                <option value="F">Femme</option>
                <option value="NB">Non-binaire</option>
              </select>
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full pl-10 pr-12 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/40 outline-none transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-white/40 outline-none transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                S'inscrire <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-white/40 text-center text-sm mt-6">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-white hover:underline transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}