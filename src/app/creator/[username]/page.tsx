"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  User, 
  Grid,
  Heart,
  Eye,
  Share2,
  Plus,
  Edit,
  Crown,
  BadgeCheck,
  Globe,
  Check,
  UserPlus,
  Coins,
  Sparkles,
  Loader2,
  AlertCircle,
  Send,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type CreatorProfile = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  isCertified: boolean;
  premiumActive: boolean;
  premiumPlan?: string | null;
  createdAt: string;
  avatarColor: string | null;
  badgeColor?: string | null;
  manas: number;
  _count: {
    mangas: number;
    followers: number;
    following: number;
  };
  mangas?: any[];
  isFollowing?: boolean;
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [activeTab, setActiveTab] = useState<"mangas" | "about">("mangas");
  const [userManasBalance, setUserManasBalance] = useState(0);

  const [collaborating, setCollaborating] = useState(false);
  const [showSendManas, setShowSendManas] = useState(false);
  const [sendManasAmount, setSendManasAmount] = useState("");
  const [sendingManas, setSendingManas] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchUserBalance = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/manas/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserManasBalance(data.balance);
        }
      } catch (error) {
        console.error("Erreur récupération solde:", error);
      }
    };

    fetchUserBalance();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/users/username/${username}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          throw new Error("Utilisateur non trouvé");
        }

        const data = await res.json();
        setProfile(data);

        if (token) {
          try {
            const meRes = await fetch(`${API_URL}/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              setIsCurrentUser(meData.id === data.id);

              if (meData.id !== data.id) {
                const followRes = await fetch(`${API_URL}/follow/is-following/${data.id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (followRes.ok) {
                  const followData = await followRes.json();
                  setIsFollowing(followData.following || false);
                }
              }
            }
          } catch (e) {
            console.error("Erreur vérification statut:", e);
          }
        }
      } catch (err: any) {
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const handleFollow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!profile) return;

    try {
      const res = await fetch(`${API_URL}/follow/${profile.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        const newStatus = data.following !== undefined ? data.following : true;
        setIsFollowing(newStatus);
        setProfile((prev) => prev ? {
          ...prev,
          _count: {
            ...prev._count,
            followers: newStatus ? prev._count.followers + 1 : prev._count.followers - 1,
          },
        } : null);
      }
    } catch (error) {
      console.error("Erreur follow:", error);
    }
  };

  const handleCollaborate = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!profile) return;

    if (!confirm(`Envoyer 250 MANAS en collaboration avec ${profile.username} ?`)) {
      return;
    }

    setCollaborating(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/manas/collaborate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          creatorId: profile.id,
          amountInManas: 250,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la collaboration");
      }

      alert(`Collaboration réussie : 250 MANAS envoyés à ${profile.username}.`);
      setUserManasBalance(data.balance);
      router.push("/profile");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCollaborating(false);
    }
  };

  const handleSendManas = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!profile) return;

    const amount = parseInt(sendManasAmount);
    if (isNaN(amount) || amount < 1) {
      setError("Veuillez entrer un montant valide");
      return;
    }

    if (amount > userManasBalance) {
      setError("Solde insuffisant");
      return;
    }

    setSendingManas(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/manas/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: profile.id,
          amount: amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi");
      }

      alert(`Succès : ${amount} MANAS envoyés à ${profile.username}.`);
      setShowSendManas(false);
      setSendManasAmount("");
      setUserManasBalance(data.balance);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingManas(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `https://ink-drop-one.vercel.app/creator/${profile?.username}`;
    
    if (navigator.share) {
      navigator.share({
        title: `INKDROP - ${profile?.username}`,
        text: `Découvre le profil de ${profile?.username} sur INKDROP !`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Lien copié");
    }
  };

  if (loading) {
    return <Loader message="Chargement du profil" />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4">
        <div className="w-16 h-16 rounded-full bg-rose-950/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <p className="text-zinc-400 text-center">{error || "Utilisateur non trouvé"}</p>
        <Link
          href="/discover"
          className="mt-4 px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          Retourner à la découverte
        </Link>
      </div>
    );
  }

  const activeBadgeColor = profile.badgeColor || profile.avatarColor || "#3B82F6";
  const isCreator = profile.role === 'CREATOR' || profile.role === 'ADMIN';

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white selection:bg-blue-500 selection:text-white">
      {/* HEADER */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <span className="text-base font-bold tracking-tight text-white/90">
            @{profile.username.toLowerCase()}
          </span>
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      {/* BANNIÈRE */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-32 md:h-48 w-full bg-gradient-to-r from-zinc-950 via-blue-950/40 to-zinc-950 border-b border-zinc-800/40 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <span className="text-8xl font-black text-blue-500 select-none">
            {profile.username.charAt(0).toUpperCase()}
          </span>
        </div>
      </motion.div>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 -mt-14 md:-mt-20 flex flex-col items-center">
        {/* AVATAR */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
          className="relative mb-3 group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-900 overflow-hidden border-4 border-zinc-950 shadow-2xl ring-2 ring-blue-500/30 shrink-0 transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}>
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl font-black text-blue-400 bg-gradient-to-br from-zinc-800 to-zinc-900">
                {profile.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          {profile.isCertified && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute bottom-1 right-1 bg-zinc-950 p-0.5 rounded-full shadow-lg"
            >
              <BadgeCheck
                className="w-6 h-6 md:w-7 md:h-7"
                fill={activeBadgeColor}
                color="black"
                strokeWidth={1.5}
              />
            </motion.div>
          )}
        </motion.div>

        {/* NOM & BADGES */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex items-center gap-2 mb-1 flex-wrap justify-center"
        >
          <h1 className="text-xl md:text-3xl font-extrabold text-white tracking-tight">{profile.username}</h1>
          {profile.premiumActive && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] md:text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1"
            >
              <Crown className="w-3 h-3 fill-current" />
              Premium
            </motion.span>
          )}
        </motion.div>

        {/* BIO */}
        <motion.p 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
          className="text-zinc-400 text-sm md:text-base text-center mb-3 max-w-md font-normal"
        >
          {profile.bio || "Créateur sur INKDROP"}
        </motion.p>

        {/* INFOS */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-zinc-500 mb-6"
        >
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" /> 
            Membre depuis {new Date(profile.createdAt).toLocaleDateString()}
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            {profile.role === 'CREATOR' ? 'Créateur' : 'Membre'}
          </span>
          {isCreator && (
            <>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-blue-400" />
                {profile.manas || 0} MANAS
              </span>
            </>
          )}
        </motion.div>

        {/* STATS SOCIALES */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-6 md:gap-12 py-3.5 px-6 md:px-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 w-full max-w-md md:max-w-lg mb-6 backdrop-blur-md shadow-lg"
        >
          <div className="text-center">
            <motion.p 
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-lg md:text-xl font-black text-white"
            >
              {profile._count?.following || 0}
            </motion.p>
            <p className="text-[11px] md:text-xs text-zinc-400 font-medium">Abonnements</p>
          </div>
          <div className="h-7 w-[1px] bg-zinc-800" />
          <div className="text-center">
            <motion.p 
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.35, type: "spring" }}
              className="text-lg md:text-xl font-black text-white"
            >
              {profile._count?.followers || 0}
            </motion.p>
            <p className="text-[11px] md:text-xs text-zinc-400 font-medium">Abonnés</p>
          </div>
          <div className="h-7 w-[1px] bg-zinc-800" />
          <div className="text-center">
            <motion.p 
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-lg md:text-xl font-black text-blue-400"
            >
              {profile._count?.mangas || 0}
            </motion.p>
            <p className="text-[11px] md:text-xs text-zinc-400 font-medium">Mangas</p>
          </div>
        </motion.div>

        {/* BOUTONS D'ACTION */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-md md:max-w-lg mb-6"
        >
          {isCurrentUser ? (
            <>
              <Link
                href="/profile/edit"
                className="flex-1 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs md:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Link>
              <Link
                href="/creator/upload"
                className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs md:text-sm font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Publier
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={handleFollow}
                className={`flex-1 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                  isFollowing
                    ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                    : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-600/20"
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-4 h-4" />
                    Abonné
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    S'abonner
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 transition-all flex items-center justify-center"
                title="Partager"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </>
          )}
        </motion.div>

        {/* BOUTONS MANAS + COLLABORATION */}
        {!isCurrentUser && !loading && (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-wrap items-center justify-center gap-2.5 mb-6 w-full max-w-md"
          >
            <button
              onClick={() => setShowSendManas(true)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Envoyer des MANAS
            </button>

            {isCreator && (
              <button
                onClick={handleCollaborate}
                disabled={collaborating}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
                  userManasBalance >= 250
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-purple-900/30"
                    : "bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700"
                }`}
              >
                {collaborating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Collaborer (250 MANAS)
                  </>
                )}
              </button>
            )}

            {isCreator && userManasBalance < 250 && (
              <Link
                href="/payment?plan=manas"
                className="px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2"
              >
                <Coins className="w-4 h-4" />
                Acheter des MANAS
              </Link>
            )}
          </motion.div>
        )}

        {/* MESSAGE SOLDE INSUFFISANT */}
        {isCreator && userManasBalance < 250 && !isCurrentUser && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-300 text-xs mb-4 max-w-md w-full"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Solde insuffisant pour collaborer (250 MANAS requis).</span>
            <Link
              href="/payment?plan=manas"
              className="ml-auto px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold transition-all flex items-center gap-1"
            >
              <Coins className="w-3 h-3" />
              Acheter
            </Link>
          </motion.div>
        )}

        {/* BARRE D'ONGLETS */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.25 }}
          className="flex border-b border-zinc-800/80 w-full max-w-md md:max-w-xl mb-6"
        >
          <button
            onClick={() => setActiveTab("mangas")}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "mangas"
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Mangas ({profile._count?.mangas || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "about"
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <User className="w-4 h-4" />
            <span>À propos</span>
          </button>
        </motion.div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          {activeTab === "mangas" && (
            <motion.div
              key="mangas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {!profile.mangas || profile.mangas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/40 max-w-md mx-auto my-2">
                  <BookOpen className="w-10 h-10 text-zinc-700" />
                  <p className="text-zinc-400 mt-3 text-sm font-medium">Aucun manga publié</p>
                  {isCurrentUser && (
                    <Link
                      href="/creator/upload"
                      className="mt-4 px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow shadow-blue-600/20"
                    >
                      Publier ton premier projet
                    </Link>
                  )}
                </div>
              ) : (
                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3"
                >
                  {profile.mangas.map((manga: any, index: number) => (
                    <motion.div
                      key={manga.id}
                      variants={fadeInUp}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Link
                        href={`/manga/${manga.id}`}
                        className="group relative aspect-[2/3] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/60 hover:border-blue-500/50 transition-all duration-200 block"
                      >
                        {manga.coverUrl || manga.imageUrl ? (
                          <img 
                            src={manga.coverUrl || manga.imageUrl} 
                            alt={manga.title} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-zinc-700" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between">
                          <span className="flex items-center gap-1 text-white text-[10px] md:text-xs font-bold drop-shadow">
                            <Eye className="w-3 h-3 text-sky-400" /> {manga.viewsCount || 0}
                          </span>
                          <span className="flex items-center gap-1 text-white text-[10px] md:text-xs font-bold drop-shadow">
                            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> {manga.likesCount || 0}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 py-2 border-b border-zinc-800/40">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-zinc-300 text-sm">@{profile.username}</span>
                </div>
                {profile.bio && (
                  <div className="flex items-start gap-3 py-2 border-b border-zinc-800/40">
                    <BookOpen className="w-4 h-4 text-blue-400 mt-0.5" />
                    <span className="text-zinc-300 text-sm">{profile.bio}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 py-2 border-b border-zinc-800/40">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-zinc-300 text-sm">Membre depuis {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-zinc-800/40">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-zinc-300 text-sm">{profile.role === 'CREATOR' ? 'Créateur' : 'Membre'}</span>
                </div>
                {profile.isCertified && (
                  <div className="flex items-center gap-3 py-2 border-b border-zinc-800/40">
                    <BadgeCheck className="w-4 h-4" fill={activeBadgeColor} color="black" strokeWidth={1.5} />
                    <span className="text-zinc-300 text-sm">Compte certifié</span>
                  </div>
                )}
                {profile.premiumActive && (
                  <div className="flex items-center gap-3 py-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-zinc-300 text-sm">Abonnement Premium actif</span>
                  </div>
                )}
                {isCreator && (
                  <div className="flex items-center gap-3 py-2 border-t border-zinc-800/40 pt-3">
                    <Coins className="w-4 h-4 text-blue-400" />
                    <span className="text-zinc-300 text-sm">{profile.manas || 0} MANAS</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />

      {/* MODAL ENVOYER DES MANAS */}
      <AnimatePresence>
        {showSendManas && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSendManas(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                Envoyer des MANAS
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                À <span className="text-white font-bold">{profile.username}</span>
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Montant en MANAS
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sendManasAmount}
                    onChange={(e) => setSendManasAmount(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-all"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Votre solde : {userManasBalance} MANAS
                  </p>
                </div>

                {error && (
                  <p className="text-xs text-rose-400">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleSendManas}
                    disabled={sendingManas || parseInt(sendManasAmount) < 1}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sendingManas ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Envoyer
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowSendManas(false);
                      setSendManasAmount("");
                      setError("");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePres
