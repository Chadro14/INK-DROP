"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import { ReelGrid } from "@/components/reels/ReelGrid";
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
  ShoppingCart,
  Film,
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

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [activeTab, setActiveTab] = useState<"mangas" | "reels" | "about">("mangas");
  const [userManasBalance, setUserManasBalance] = useState(0);

  const [collaborating, setCollaborating] = useState(false);
  const [showSendManas, setShowSendManas] = useState(false);
  const [sendManasAmount, setSendManasAmount] = useState("");
  const [sendingManas, setSendingManas] = useState(false);

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
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                _count: {
                  ...prev._count,
                  followers: newStatus
                    ? prev._count.followers + 1
                    : prev._count.followers - 1,
                },
              }
            : null
        );
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

  const handleBuyManas = () => {
    router.push("/acheter-manas?redirect=/creator/" + username);
  };

  const GalaxyIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="galaxyGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </radialGradient>
        <radialGradient id="galaxyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C084FC" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="4" fill="url(#galaxyGrad)" stroke="#A78BFA" strokeWidth="1.5" />
      <path
        d="M12 4C8 4 4 8 4 12C4 16 8 20 12 20C16 20 20 16 20 12"
        stroke="url(#galaxyGrad)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M12 4C16 4 20 8 20 12C20 16 16 20 12 20C8 20 4 16 4 12"
        stroke="url(#galaxyGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="6" cy="8" r="1" fill="#C084FC" opacity="0.7" />
      <circle cx="18" cy="16" r="1" fill="#A78BFA" opacity="0.7" />
      <circle cx="8" cy="18" r="0.8" fill="#8B5CF6" opacity="0.6" />
      <circle cx="16" cy="6" r="0.8" fill="#7C3AED" opacity="0.6" />
      <circle cx="5" cy="14" r="0.6" fill="#C084FC" opacity="0.5" />
      <circle cx="19" cy="10" r="0.6" fill="#A78BFA" opacity="0.5" />
      <circle cx="12" cy="12" r="10" fill="url(#galaxyGlow)" opacity="0.3" />
    </svg>
  );

  if (loading) {
    return <Loader message="Chargement du profil" />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-500 dark:text-rose-400" />
        </div>
        <p className="text-muted-foreground text-center">
          {error || "Utilisateur non trouvé"}
        </p>
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
  const isCreator = profile.role === "CREATOR" || profile.role === "ADMIN";

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-card flex items-center gap-1.5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Retour</span>
          </button>
          <span className="text-base font-bold tracking-tight text-foreground/90">
            @{profile.username.toLowerCase()}
          </span>
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* BANNIÈRE */}
      <div className="h-20 md:h-28 w-full border-b border-border/40 relative overflow-hidden">
        <img
          src="https://files.catbox.moe/cs135g.png"
          alt="Couverture"
          className="absolute inset-0 w-full h-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <span className="text-8xl font-black text-white select-none">
            {profile.username.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 -mt-14 md:-mt-20 flex flex-col items-center">
        {/* AVATAR */}
        <div className="relative mb-3 group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-muted overflow-hidden border-4 border-background shadow-2xl ring-2 ring-blue-500/30 shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl font-black text-blue-500 bg-gradient-to-br from-card to-muted">
                {profile.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          {profile.isCertified && (
            <div className="absolute bottom-1 right-1 bg-background p-0.5 rounded-full shadow-lg">
              <BadgeCheck
                className="w-6 h-6 md:w-7 md:h-7"
                fill={activeBadgeColor}
                color="black"
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        {/* NOM + GALAXY ICON */}
        <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
          <h1 className="text-xl md:text-3xl font-extrabold text-foreground tracking-tight">
            {profile.username}
          </h1>

          {profile.premiumActive && (
            <span className="relative">
              <span className="absolute inset-0 rounded-full blur-2xl bg-violet-500/40 animate-pulse" />
              <span className="absolute inset-0">
                <span
                  className="absolute -top-1 -right-1 w-1 h-1 bg-violet-300 rounded-full animate-ping"
                  style={{ animationDuration: "1.2s" }}
                />
                <span
                  className="absolute -bottom-1 -left-1 w-0.5 h-0.5 bg-violet-300 rounded-full animate-ping"
                  style={{ animationDuration: "0.8s", animationDelay: "0.4s" }}
                />
              </span>
              <GalaxyIcon className="w-6 h-6 relative z-10" />
            </span>
          )}
        </div>

        {/* BIO */}
        <p className="text-muted-foreground text-sm md:text-base text-center mb-3 max-w-md font-normal">
          {profile.bio || "Créateur sur INKDROP"}
        </p>

        {/* INFOS */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            Membre depuis {new Date(profile.createdAt).toLocaleDateString()}
          </span>
          <span className="w-1 h-1 rounded-full bg-muted" />
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            {profile.role === "CREATOR" ? "Créateur" : "Membre"}
          </span>
          {isCreator && (
            <>
              <span className="w-1 h-1 rounded-full bg-muted" />
              <span className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-blue-400" />
                {profile.manas || 0} MANAS
              </span>
            </>
          )}
        </div>

        {/* STATS SOCIALES */}
        <div className="flex items-center justify-center gap-6 md:gap-12 py-3.5 px-6 md:px-12 bg-card/40 rounded-2xl border border-border/60 w-full max-w-md md:max-w-lg mb-6 backdrop-blur-md shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-xl font-black text-foreground">
              {profile._count?.following || 0}
            </p>
            <p className="text-[11px] md:text-xs text-muted-foreground font-medium">
              Abonnements
            </p>
          </div>
          <div className="h-7 w-[1px] bg-border" />
          <div className="text-center">
            <p className="text-lg md:text-xl font-black text-foreground">
              {profile._count?.followers || 0}
            </p>
            <p className="text-[11px] md:text-xs text-muted-foreground font-medium">
              Abonnés
            </p>
          </div>
          <div className="h-7 w-[1px] bg-border" />
          <div className="text-center">
            <p className="text-lg md:text-xl font-black text-blue-500">
              {profile._count?.mangas || 0}
            </p>
            <p className="text-[11px] md:text-xs text-muted-foreground font-medium">
              Mangas
            </p>
          </div>
        </div>

        {/* BOUTONS ACTION */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-md md:max-w-lg mb-6">
          {isCurrentUser ? (
            <>
              <Link
                href="/profile/edit"
                className="flex-1 py-2.5 rounded-full bg-foreground hover:bg-foreground/90 text-background text-xs md:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
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
                    ? "bg-muted hover:bg-muted/80 text-foreground border border-border"
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
                className="p-2.5 rounded-full bg-card hover:bg-muted text-foreground border border-border transition-all flex items-center justify-center"
                title="Partager"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* BOUTONS MANAS */}
        {!isCurrentUser && !loading && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6 w-full max-w-md">
            <button
              onClick={() => setShowSendManas(true)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Envoyer des MANAS
            </button>

            <button
              onClick={handleBuyManas}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Acheter des MANAS
            </button>

            {isCreator && (
              <button
                onClick={handleCollaborate}
                disabled={collaborating}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
                  userManasBalance >= 250
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-purple-900/30"
                    : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
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
          </div>
        )}

        {/* ALERTE SOLDE INSUFFISANT */}
        {isCreator && userManasBalance < 250 && !isCurrentUser && (
          <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-300 text-xs mb-4 max-w-md w-full">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Solde insuffisant pour collaborer (250 MANAS requis).</span>
          </div>
        )}

        {/* TABS */}
        <div className="flex border-b border-border/80 w-full max-w-md md:max-w-xl mb-6">
          <button
            onClick={() => setActiveTab("mangas")}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "mangas"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Mangas ({profile._count?.mangas || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("reels")}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "reels"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Reels</span>
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "about"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            <span>À propos</span>
          </button>
        </div>

        {/* TAB MANGAS */}
        {activeTab === "mangas" && (
          <div className="w-full">
            {!profile.mangas || profile.mangas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card/30 rounded-2xl border border-border/40 max-w-md mx-auto my-2">
                <BookOpen className="w-10 h-10 text-muted-foreground/50" />
                <p className="text-muted-foreground mt-3 text-sm font-medium">
                  Aucun manga publié
                </p>
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
                {profile.mangas.map((manga: any) => (
                  <Link
                    key={manga.id}
                    href={`/manga/${manga.id}`}
                    className="group relative aspect-[2/3] bg-muted rounded-lg overflow-hidden border border-border/60 hover:scale-[1.02] hover:border-blue-500/50 transition-all duration-200"
                  >
                    {manga.coverUrl || manga.imageUrl ? (
                      <img
                        src={manga.coverUrl || manga.imageUrl}
                        alt={manga.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-muted-foreground/30" />
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
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB REELS */}
        {activeTab === "reels" && (
          <div className="w-full">
            <ReelGrid
              userId={profile.id}
              isOwner={isCurrentUser}
              emptyHint={
                isCurrentUser
                  ? "Vous n'avez pas encore publié de Reel"
                  : "Aucun Reel publié"
              }
            />
          </div>
        )}

        {/* TAB À PROPOS */}
        {activeTab === "about" && (
          <div className="w-full max-w-md mx-auto">
            <div className="bg-card/40 border border-border/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 py-2 border-b border-border/40">
                <User className="w-4 h-4 text-blue-500" />
                <span className="text-foreground text-sm">@{profile.username}</span>
              </div>
              {profile.bio && (
                <div className="flex items-start gap-3 py-2 border-b border-border/40">
                  <BookOpen className="w-4 h-4 text-blue-500 mt-0.5" />
                  <span className="text-foreground text-sm">{profile.bio}</span>
                </div>
              )}
              <div className="flex items-center gap-3 py-2 border-b border-border/40">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-foreground text-sm">
                  Membre depuis {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-border/40">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-foreground text-sm">
                  {profile.role === "CREATOR" ? "Créateur" : "Membre"}
                </span>
              </div>
              {profile.isCertified && (
                <div className="flex items-center gap-3 py-2 border-b border-border/40">
                  <BadgeCheck
                    className="w-4 h-4"
                    fill={activeBadgeColor}
                    color="black"
                    strokeWidth={1.5}
                  />
                  <span className="text-foreground text-sm">Compte certifié</span>
                </div>
              )}
              {profile.premiumActive && (
                <div className="flex items-center gap-3 py-2">
                  <GalaxyIcon className="w-5 h-5" />
                  <span className="text-foreground text-sm">
                    Abonnement Premium actif
                  </span>
                </div>
              )}
              {isCreator && (
                <div className="flex items-center gap-3 py-2 border-t border-border/40 pt-3">
                  <Coins className="w-4 h-4 text-blue-500" />
                  <span className="text-foreground text-sm">
                    {profile.manas || 0} MANAS
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <BottomNav />

      {/* MODAL SEND MANAS */}
      {showSendManas && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border/80 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-500" />
              Envoyer des MANAS
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              À <span className="text-foreground font-bold">{profile.username}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Montant en MANAS
                </label>
                <input
                  type="number"
                  min="1"
                  value={sendManasAmount}
                  onChange={(e) => setSendManasAmount(e.target.value)}
                  placeholder="10"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-emerald-500 outline-none transition-all"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Votre solde : {userManasBalance} MANAS
                </p>
              </div>

              {error && <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>}

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
                  className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
