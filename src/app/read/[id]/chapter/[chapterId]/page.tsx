"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CommentSection } from "@/components/comments/CommentSection";
import { Loader } from "@/components/ui/loader";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Lock,
  Heart,
  Sparkles,
  Crown,
  Share2,
  Bookmark,
  Check,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Coins,
  Loader2,
  Ticket,
  ShoppingCart,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Page = {
  url: string;
  order: number;
  isFree: boolean;
};

type Chapter = {
  id: string;
  number: number;
  title: string;
  contentType: string;
  pdfUrl: string | null;
  pages: Page[];
  isFree: boolean;
  price: number;
  pageCount: number;
  summary: string | null;
  publishedAt: string;
  manga: {
    id: string;
    title: string;
    author: {
      username: string;
    };
  };
};

type User = {
  id: string;
  premiumActive: boolean;
};

export default function ChapterReader() {
  const params = useParams();
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [manasEarned, setManasEarned] = useState(false);
  const [manasBalance, setManasBalance] = useState(0);
  const [ticketBalance, setTicketBalance] = useState(0);
  const [hasUnlimitedTickets, setHasUnlimitedTickets] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const mangaId = params.id as string;
  const chapterId = params.chapterId as string;
  const chapterNumber = parseInt(chapterId);

  const fetchBalances = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [manasRes, ticketRes] = await Promise.all([
        fetch(`${API_URL}/manas/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/tickets/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (manasRes.ok) {
        const data = await manasRes.json();
        setManasBalance(data.balance);
      }

      if (ticketRes.ok) {
        const data = await ticketRes.json();
        setTicketBalance(data.tickets);
        setHasUnlimitedTickets(data.hasUnlimitedTickets || false);
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const earnManasForReading = async () => {
    const token = localStorage.getItem("token");
    if (!token || manasEarned) return;

    try {
      const res = await fetch(`${API_URL}/manas/event/chapter-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chapterId: chapter?.id,
          mangaId: mangaId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setManasEarned(true);
        setManasBalance(data.balance);
      }
    } catch (error) {
      console.error("Error earning MANAS:", error);
    }
  };

  const checkIfLiked = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/social/has-liked-chapter/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
      }
    } catch (error) {
      console.error("Error checking like:", error);
    }
  };

  const handlePayWithTicket = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/tickets/use/${chapter?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error using ticket");
      }

      setHasAccess(true);
      if (data.remainingTickets !== 'illimité') {
        setTicketBalance(data.remainingTickets);
      }
      setSuccess(true);
      setPaymentMessage("Chapter unlocked with a ticket!");
      setTimeout(() => setSuccess(false), 3000);
      earnManasForReading();
    } catch (err: any) {
      setError(err.message || "Payment error");
    } finally {
      setProcessing(false);
    }
  };

  const handlePayWithManas = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/manas/purchase-chapter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mangaId: mangaId,
          chapterNumber: chapterNumber,
          priceInManas: 50,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Payment error");
      }

      setHasAccess(true);
      setManasBalance(data.balance);
      setSuccess(true);
      setPaymentMessage("Chapter unlocked with 50 MANAS!");
      setTimeout(() => setSuccess(false), 3000);
      earnManasForReading();
    } catch (err: any) {
      setError(err.message || "Payment error");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const url = `${API_URL}/mangas/${mangaId}/chapters/number/${chapterNumber}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`Chapter not found (${res.status})`);
        }
        
        const data = await res.json();
        setChapter(data);

        const token = localStorage.getItem("token");
        if (token) {
          const userRes = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);
            if (data.isFree || userData.premiumActive) {
              setHasAccess(true);
            }
          }
          
          await checkIfLiked();
          await fetchBalances();
          
        } else if (data.isFree) {
          setHasAccess(true);
        }
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [mangaId, chapterNumber]);

  useEffect(() => {
    if (hasAccess && chapter && !manasEarned) {
      earnManasForReading();
    }
  }, [hasAccess, chapter]);

  const nextPage = () => {
    if (chapter?.pages && currentPage < chapter.pages.length - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/social/like-chapter/${chapterId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error liking");

      const data = await res.json();
      setIsLiked(data.liked);
    } catch (error) {
      console.error("Error liking:", error);
      setIsLiked(!isLiked);
    }
  };

  const handleShare = () => {
    const shareUrl = `https://ink-drop-one.vercel.app/manga/${mangaId}/chapter/${chapterNumber}`;
    if (navigator.share) {
      navigator.share({ title: chapter?.title || `Chapter ${chapterNumber}`, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied!");
    }
  };

  if (loading) {
    return <Loader message="Loading..." />;
  }

  if (error || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4">
        <div className="w-16 h-16 rounded-full bg-rose-950/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Loading error</h2>
        <p className="text-zinc-400 text-center max-w-md">{error || "Chapter not found"}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
          >
            Retry
          </button>
          <Link
            href={`/manga/${mangaId}`}
            className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-all"
          >
            Back to manga
          </Link>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
        <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Link href={`/manga/${mangaId}`} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <span className="text-base font-bold tracking-tight text-white/90">
              Chap. {chapterNumber}
            </span>
            <div className="w-9" />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-amber-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Premium Chapter</h2>
          <p className="text-zinc-400 text-sm mb-1">
            Chapter {chapterNumber} — <span className="text-amber-400 font-semibold">{chapter.price || 0.50}$</span>
          </p>
          <p className="text-zinc-500 text-xs mb-6">
            {chapter.pageCount || 0} pages
          </p>
          
          {success && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{paymentMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500 mb-4">
            <span>MANAS: <span className="text-blue-400 font-bold">{manasBalance}</span></span>
            <span className="w-px h-4 bg-zinc-700" />
            <span>Tickets: <span className="text-purple-400 font-bold">{hasUnlimitedTickets ? '♾️ Unlimited' : ticketBalance}</span></span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              onClick={handlePayWithTicket}
              disabled={processing || (!hasUnlimitedTickets && ticketBalance < 1)}
              className={`flex-1 px-6 py-2.5 rounded-full font-bold transition-all flex items-center justify-center gap-2 ${
                (hasUnlimitedTickets || ticketBalance > 0)
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-600/20"
                  : "bg-zinc-800 text-zinc-400 cursor-not-allowed"
              }`}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  {hasUnlimitedTickets ? "Unlimited tickets" : ticketBalance > 0 ? "Use a ticket" : "No tickets"}
                </>
              )}
            </button>

            <button
              onClick={handlePayWithManas}
              disabled={processing || manasBalance < 50}
              className={`flex-1 px-6 py-2.5 rounded-full font-bold transition-all flex items-center justify-center gap-2 ${
                manasBalance >= 50
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-600/20"
                  : "bg-zinc-800 text-zinc-400 cursor-not-allowed"
              }`}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  {manasBalance >= 50 ? "Pay 50 MANAS" : `Insufficient MANAS (${manasBalance}/50)`}
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col items-center gap-1 mt-3">
            {manasBalance < 50 && (
              <Link
                href={`/acheter-manas?redirect=/read/${mangaId}/chapter/${chapterNumber}`}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy MANAS
              </Link>
            )}
            
            {!hasUnlimitedTickets && ticketBalance < 1 && (
              <Link
                href="/profile/tickets"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5"
              >
                <Ticket className="w-4 h-4" />
                Get tickets
              </Link>
            )}
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Subscribe to INKDROP Premium for unlimited access</span>
          </div>
          <Link href="/premium" className="mt-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
            View Premium offers →
          </Link>
        </main>

        <BottomNav />
      </div>
    );
  }

  const isPdf = chapter.contentType === 'PDF';

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href={`/manga/${mangaId}`} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <span className="text-base font-bold tracking-tight text-white/90 truncate max-w-[150px]">
            Chap. {chapterNumber}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full hover:bg-zinc-900 transition-colors ${isBookmarked ? "text-blue-400" : "text-zinc-400 hover:text-white"}`}
            >
              {isBookmarked ? <Check className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLike}
              className={`p-2 rounded-full hover:bg-zinc-900 transition-colors ${isLiked ? "text-rose-500" : "text-zinc-400 hover:text-white"}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-rose-500" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            {chapter.title || `Chapter ${chapterNumber}`}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">{chapter.manga.title}</p>
          <div className="flex items-center justify-center gap-3 mt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              {isPdf ? <FileText className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
              {chapter.pageCount || 0} pages
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className={chapter.isFree ? "text-emerald-400" : "text-amber-400"}>
              {chapter.isFree ? "Free" : `${chapter.price || 0.50}$`}
            </span>
          </div>
        </div>

        {chapter.summary && (
          <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-blue-400">Chapter summary</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{chapter.summary}</p>
          </div>
        )}

        {isPdf && (
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/80 overflow-hidden shadow-xl">
            {chapter.pdfUrl ? (
              <iframe
                src={chapter.pdfUrl}
                className="w-full h-[70vh] border-0"
                title={`Chapter ${chapterNumber}`}
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-96 bg-zinc-900/40 rounded-xl p-8 text-center">
                <FileText className="w-12 h-12 text-zinc-600 mb-4" />
                <p className="text-zinc-400">PDF not available</p>
                <p className="text-zinc-500 text-xs mt-1">The file could not be loaded</p>
              </div>
            )}
          </div>
        )}

        {!isPdf && chapter.pages && chapter.pages.length > 0 && (
          <div className="space-y-4">
            <div className="text-center text-sm text-zinc-500">
              Page {currentPage + 1} / {chapter.pages.length}
            </div>

            <div className="relative bg-zinc-900/40 rounded-xl border border-zinc-800/80 overflow-hidden shadow-xl">
              {chapter.pages[currentPage]?.url ? (
                <img
                  src={chapter.pages[currentPage].url}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full h-auto rounded-xl"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-zinc-900/40 p-8 text-center">
                  <ImageIcon className="w-12 h-12 text-zinc-600 mb-4" />
                  <p className="text-zinc-400">Image not available</p>
                  <p className="text-zinc-500 text-xs mt-1">Page {currentPage + 1}</p>
                </div>
              )}

              {currentPage > 0 && (
                <button
                  onClick={prevPage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-700 transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {currentPage < chapter.pages.length - 1 && (
                <button
                  onClick={nextPage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-700 transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            <div className="flex justify-center gap-1.5">
              {chapter.pages.slice(0, 20).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentPage(index);
                    window.scrollTo(0, 0);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentPage
                      ? "w-6 bg-blue-500"
                      : "w-1.5 bg-zinc-600 hover:bg-zinc-500"
                  }`}
                />
              ))}
              {chapter.pages.length > 20 && (
                <span className="text-[10px] text-zinc-500 ml-1">
                  +{chapter.pages.length - 20}
                </span>
              )}
            </div>
          </div>
        )}

        {!isPdf && (!chapter.pages || chapter.pages.length === 0) && (
          <div className="flex flex-col items-center justify-center h-96 bg-zinc-900/40 rounded-xl border border-zinc-800/80 p-8 text-center">
            <ImageIcon className="w-12 h-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400">No pages available</p>
            <p className="text-zinc-500 text-xs mt-1">This chapter does not contain images</p>
          </div>
        )}

        <div className="mt-8">
          <CommentSection mangaId={mangaId} chapterId={chapter.id} />
        </div>

        <div className="flex items-center justify-between gap-2 mt-6">
          <Link
            href={`/manga/${mangaId}/chapter/${chapterNumber - 1}`}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              chapterNumber > 1
                ? "bg-zinc-800/60 hover:bg-zinc-800 text-white border border-zinc-700/50"
                : "bg-zinc-900/40 text-zinc-600 cursor-not-allowed pointer-events-none border border-zinc-800/30"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Link>
          <Link
            href={`/manga/${mangaId}`}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-zinc-800/60 hover:bg-zinc-800 text-white border border-zinc-700/50 transition-all"
          >
            All chapters
          </Link>
          <Link
            href={`/manga/${mangaId}/chapter/${chapterNumber + 1}`}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
