"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import QRCode from "qrcode";
import {
  ArrowLeft,
  Download,
  Share2,
  Users,
  Clock,
  QrCode,
  BadgeCheck,
  Crown,
  User,
  Calendar,
  Copy,
  Check,
  Eye,
  Sparkles,
  Palette,
  Zap,
  RefreshCw,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

// ✅ STYLES DISPONIBLES (comme TikTok)
const STYLES = [
  { id: "default", name: "Défaut", gradient: ["#3B82F6", "#8B5CF6"] },
  { id: "sunset", name: "Coucher", gradient: ["#FF6B35", "#F03E5B"] },
  { id: "ocean", name: "Océan", gradient: ["#00D4FF", "#6B46FF"] },
  { id: "forest", name: "Forêt", gradient: ["#10B981", "#047857"] },
  { id: "fire", name: "Feu", gradient: ["#FF6B35", "#FFE66D"] },
  { id: "galaxy", name: "Galaxie", gradient: ["#7C4DFF", "#E040FB"] },
];

type QRData = {
  userId: string;
  username: string;
  qrData: string;
  scanCount: number;
  avatarUrl?: string | null;
  isCertified?: boolean;
  premiumActive?: boolean;
  createdAt?: string;
  qrColor?: string;
  badgeColor?: string;
};

// ============================================
// UTILITAIRES CANVAS
// ============================================
function adjustColor(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  const full = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const num = parseInt(full, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
const lighten = (hex: string, amt: number) => adjustColor(hex, amt);
const darken = (hex: string, amt: number) => adjustColor(hex, -amt);

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImage(src: string, cors = false): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Échec chargement image"));
    img.src = src;
  });
}

// ============================================
// GÉNÈRE LA CARTE QR (STYLE TIKTOK)
// ============================================
async function buildQRCard(opts: {
  text: string;
  colors: string[];
  avatarUrl?: string | null;
  size: number;
  showLabel?: boolean;
}): Promise<HTMLCanvasElement> {
  const { text, colors, avatarUrl, size, showLabel = true } = opts;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const radius = size * 0.08;

  // 1. Fond avec dégradé
  roundRectPath(ctx, 0, 0, size, size, radius);
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(0.5, colors[1]);
  grad.addColorStop(1, colors[1]);
  ctx.fillStyle = grad;
  ctx.fill();

  // 2. Effet de brillance
  const glowGrad = ctx.createRadialGradient(
    size * 0.2, size * 0.2, 0,
    size * 0.2, size * 0.2, size * 0.9
  );
  glowGrad.addColorStop(0, "rgba(255,255,255,0.12)");
  glowGrad.addColorStop(0.5, "rgba(255,255,255,0.04)");
  glowGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, size, size);

  // 3. QR Code
  const qrSize = size * 0.72;
  const qrDataUrl = await QRCode.toDataURL(text, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: Math.round(qrSize),
    color: { dark: "#0B0B14FF", light: "#00000000" },
  });
  const qrImg = await loadImage(qrDataUrl);
  const qrX = (size - qrSize) / 2;
  const qrY = (size - qrSize) / 2 - size * 0.02;

  // Halo blanc derrière le QR
  roundRectPath(
    ctx,
    qrX - size * 0.025,
    qrY - size * 0.025,
    qrSize + size * 0.05,
    qrSize + size * 0.05,
    size * 0.04
  );
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();

  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // 4. Avatar au centre (POUR TOUS)
  if (avatarUrl) {
    try {
      const avatarImg = await loadImage(avatarUrl, true);
      const avSize = size * 0.16;
      const cx = size / 2;
      const cy = size / 2 - size * 0.02;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, avSize / 2 + size * 0.015, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(cx, cy, avSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, cx - avSize / 2, cy - avSize / 2, avSize, avSize);
      ctx.restore();
    } catch {
      // Avatar indisponible
    }
  }

  // 5. Label "Scannez-moi"
  if (showLabel) {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = `600 ${size * 0.04}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("✦ SCANNEZ-MOI ✦", size / 2, size - size * 0.045);
  }

  return canvas;
}

export default function QRCodePage() {
  const router = useRouter();
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [updating, setUpdating] = useState(false);
  const [showStyles, setShowStyles] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const activeBadgeColor = qrData?.badgeColor || qrData?.qrColor || "#3B82F6";
  const isPremium = qrData?.premiumActive || false;

  // ============================================
  // FONCTION DE GÉNÉRATION DU QR
  // ============================================
  const generateQR = async () => {
    if (!qrData?.qrData || !previewCanvasRef.current) return;
    
    try {
      const card = await buildQRCard({
        text: qrData.qrData,
        colors: selectedStyle.gradient,
        avatarUrl: qrData.avatarUrl,
        size: 300,
        showLabel: true,
      });
      const ctx = previewCanvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, 300, 300);
      ctx?.drawImage(card, 0, 0);
    } catch (e) {
      console.error("Erreur génération QR:", e);
    }
  };

  // ============================================
  // CHARGEMENT INITIAL
  // ============================================
  useEffect(() => {
    const fetchQR = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [qrRes, userRes] = await Promise.all([
          fetch(`${API_URL}/qr/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!qrRes.ok || !userRes.ok) {
          throw new Error("Erreur lors du chargement");
        }

        const qr = await qrRes.json();
        const user = await userRes.json();

        const defaultColor = "#3B82F6";
        const badgeColor = user.badgeColor || qr.badgeColor || defaultColor;
        const qrColor = qr.qrColor || user.badgeColor || defaultColor;

        setQrData({
          ...qr,
          avatarUrl: user.avatarUrl || null,
          isCertified: user.isCertified || false,
          premiumActive: user.premiumActive || false,
          createdAt: user.createdAt || new Date().toISOString(),
          qrColor,
          badgeColor,
        });
      } catch (err: any) {
        console.error("❌ Erreur fetchQR:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQR();
  }, [router]);

  // ============================================
  // APERÇU EN DIRECT - AVEC FORCER LE RENDU
  // ============================================
  useEffect(() => {
    if (!qrData?.qrData || !previewCanvasRef.current) return;
    
    // ✅ FORCER LE RENDU APRÈS UN PETIT DÉLAI
    const timeout = setTimeout(() => {
      generateQR();
    }, 100);

    return () => clearTimeout(timeout);
  }, [qrData?.qrData, qrData?.avatarUrl, selectedStyle]);

  // ============================================
  // CHANGER LE STYLE
  // ============================================
  const changeStyle = async (style: typeof STYLES[0]) => {
    if (!isPremium) {
      alert("Cette fonctionnalité est réservée aux utilisateurs Premium");
      return;
    }
    setSelectedStyle(style);
    setShowStyles(false);
    // ✅ REGÉNÉRER LE QR APRÈS CHANGEMENT DE STYLE
    setTimeout(() => generateQR(), 50);
  };

  // ============================================
  // PARTAGER
  // ============================================
  const handleShare = async () => {
    if (!qrData) return;

    try {
      const W = 800;
      const H = 1000;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#0a0a12");
      bgGrad.addColorStop(1, "#050508");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      const cardSize = 520;
      const card = await buildQRCard({
        text: qrData.qrData,
        colors: selectedStyle.gradient,
        avatarUrl: qrData.avatarUrl,
        size: cardSize,
        showLabel: true,
      });
      const cardX = (W - cardSize) / 2;
      const cardY = 80;

      ctx.save();
      ctx.shadowColor = `${selectedStyle.gradient[0]}66`;
      ctx.shadowBlur = 60;
      ctx.drawImage(card, cardX, cardY);
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 36px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`@${qrData.username}`, W / 2, cardY + cardSize + 55);

      ctx.fillStyle = qrData.isCertified ? "#8B5CF6" : "#6B7280";
      ctx.font = "18px Arial";
      ctx.fillText(
        qrData.isCertified ? "✦ Créateur certifié" : "Membre INKDROP",
        W / 2,
        cardY + cardSize + 90
      );

      ctx.fillStyle = selectedStyle.gradient[0];
      ctx.font = "700 18px Arial";
      ctx.fillText("INKDROP", W / 2, H - 40);

      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b as Blob), "image/png")
      );
      const file = new File([blob], `qr-${qrData.username}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `QR Code de ${qrData.username}`,
          text: `Scanne le QR Code de ${qrData.username} sur INKDROP`,
          files: [file],
        });
      } else {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `qr-${qrData.username}.png`;
        link.click();
      }
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch (err) {
      console.error("Erreur partage:", err);
    }
  };

  const downloadQR = async () => {
    if (!qrData) return;
    try {
      const card = await buildQRCard({
        text: qrData.qrData,
        colors: selectedStyle.gradient,
        avatarUrl: qrData.avatarUrl,
        size: 900,
        showLabel: true,
      });
      const link = document.createElement("a");
      link.download = `qr-${qrData.username}.png`;
      link.href = card.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Erreur téléchargement:", err);
    }
  };

  const copyLink = async () => {
    if (!qrData) return;
    await navigator.clipboard.writeText(qrData.qrData);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return <Loader message="Génération de votre QR code" />;
  }

  if (error || !qrData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white px-4">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
          <QrCode className="w-8 h-8 text-zinc-600" />
        </div>
        <p className="text-zinc-400 text-center">{error || "QR non trouvé"}</p>
        <Link
          href="/profile"
          className="mt-4 px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          Retourner au profil
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link
            href="/profile"
            className="text-white/60 hover:text-white transition-colors flex items-center gap-1.5 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <span className="text-sm font-bold text-white/90 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            QR Code
          </span>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 flex flex-col items-center">

        {/* ===== CARTE PRINCIPALE ===== */}
        <div className={`relative w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 border overflow-hidden mt-6 ${
          isPremium 
            ? 'bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border-zinc-800/60' 
            : 'bg-zinc-900/40 border-zinc-800/60'
        }`}>

          {isPremium && (
            <>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite]" />
            </>
          )}

          {/* ===== EN-TÊTE ===== */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-zinc-800/60 relative z-10">
            <div className="relative shrink-0">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-zinc-900 overflow-hidden ring-2 ring-blue-500/30 ring-offset-2 ring-offset-zinc-950">
                {qrData.avatarUrl ? (
                  <img
                    src={qrData.avatarUrl}
                    alt={qrData.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-black text-blue-400 bg-gradient-to-br from-zinc-800 to-zinc-900">
                    {qrData.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
              {qrData.isCertified && (
                <div className="absolute bottom-0 right-0 bg-zinc-950 p-0.5 rounded-full shadow-lg">
                  <BadgeCheck
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill={activeBadgeColor}
                    color="black"
                    strokeWidth={1.5}
                  />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white truncate">@{qrData.username}</h2>
                {isPremium && (
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                )}
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-2">
                <User className="w-3 h-3" />
                {qrData.isCertified ? "Créateur certifié" : "Membre INKDROP"}
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <Calendar className="w-3 h-3" />
                {qrData.createdAt
                  ? new Date(qrData.createdAt).toLocaleDateString()
                  : "Nouveau"}
              </p>
            </div>
          </div>

          {/* ===== QR CODE ===== */}
          <div className="flex flex-col items-center relative z-10">
            <div
              style={{
                filter: `drop-shadow(0 25px 45px ${selectedStyle.gradient[0]}30)`,
              }}
            >
              <canvas ref={previewCanvasRef} width={300} height={300} className="block rounded-2xl" />
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-white flex items-center justify-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                Scanner pour découvrir le profil
              </p>
              {isPremium && (
                <p className="text-xs text-purple-400/60 mt-1 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  QR Code Premium
                </p>
              )}
            </div>
          </div>

          {/* ===== BOUTON "CHANGER LE STYLE" ===== */}
          <div className="mt-6 relative z-10">
            <button
              onClick={() => {
                if (!isPremium) {
                  alert("Cette fonctionnalité est réservée aux utilisateurs Premium");
                  return;
                }
                setShowStyles(!showStyles);
              }}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/40 hover:border-blue-500/30 transition-all group"
            >
              <Palette className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-medium text-white">
                {isPremium ? `Style actuel : ${selectedStyle.name}` : "🔒 Style réservé aux Premium"}
              </span>
              <RefreshCw className={`w-4 h-4 text-zinc-500 transition-transform ${showStyles ? 'rotate-180' : ''}`} />
            </button>

            {showStyles && isPremium && (
              <div className="mt-3 p-3 bg-zinc-900/80 rounded-xl border border-zinc-800/40">
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-3 text-center">
                  ✨ Choisissez un style
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => changeStyle(style)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                        selectedStyle.id === style.id
                          ? "bg-white/10 ring-2 ring-white ring-offset-2 ring-offset-zinc-950"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div
                        className="w-12 h-8 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${style.gradient[0]}, ${style.gradient[1]})`,
                        }}
                      />
                      <span className="text-[9px] text-zinc-400">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===== STATISTIQUES ===== */}
          <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
            <div className="bg-zinc-900/60 rounded-2xl p-4 text-center border border-zinc-800/40 hover:border-blue-500/30 transition-all group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-black text-white">{qrData.scanCount}</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Scans</p>
            </div>
            <div className="bg-zinc-900/60 rounded-2xl p-4 text-center border border-zinc-800/40 hover:border-blue-500/30 transition-all group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-black text-white">1</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Généré</p>
            </div>
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="flex flex-col gap-2.5 mt-6 relative z-10">
            <button
              onClick={downloadQR}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 group"
            >
              <Download className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Télécharger le QR</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white transition-all shadow-lg shadow-blue-600/20 group"
            >
              {shared ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-bold">Partagé !</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold">Partager mon QR</span>
                </>
              )}
            </button>

            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all border border-zinc-800/40 group"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Lien copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Copier le lien</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ===== MESSAGE ===== */}
        <div className="mt-6 max-w-md text-center">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Votre QR code est unique et permanent. <br />
            Partagez-le avec vos amis pour qu'ils puissent découvrir votre profil.
          </p>
          {isPremium && (
            <p className="text-xs text-purple-400/60 mt-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Premium : {STYLES.length} styles de QR disponibles
            </p>
          )}
          {!isPremium && (
            <p className="text-xs text-amber-400/60 mt-2">
              👑 Passez Premium pour personnaliser votre QR
            </p>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
