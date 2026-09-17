"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { OzyraBlocked } from "./OzyraBlocked";
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCheck,
  Zap,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";
const OZYRA_AVATAR = "https://files.catbox.moe/9xoes0.png";
const CHAT_BG = "https://files.catbox.moe/guzb7f.png";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  toolsUsed?: Array<{ name: string; success: boolean }>;
  isWelcome?: boolean;
};

type UserInfo = {
  id: string;
  username: string;
  role: string;
  premiumActive: boolean;
  premiumPlan: string | null;
  premiumExpires: string | null;
};

// ============================================
// MESSAGE D'ACCUEIL OZYRA OPLEX 2.5
// ============================================
const WELCOME_MESSAGE = `Bonjour ! 👋 Je suis **OZYRA OPLEX 2.5**, l'assistante intelligente d'INKDROP.

✨ **Nouveautés de la mise à jour OPLEX 2.5 :**
• 🔍 Je peux maintenant chercher de vrais mangas dans la base INKDROP
• 📊 Je consulte vos vraies stats (MANAS, tickets, abonnements)
• 🏆 Je connais le classement des meilleurs mangas et créateurs
• 💡 Je vous conseille pour gagner de l'argent avec vos créations
• ⚡ Réponses plus rapides et plus précises

**Comment puis-je vous aider aujourd'hui ?**`;

export function OzyraChat() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isNearBottomRef = useRef(true);

  // ============================================
  // VÉRIFIER L'UTILISATEUR
  // ============================================
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login?redirect=/chat/ozyra");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            router.push("/login?redirect=/chat/ozyra");
            return;
          }
          throw new Error("Impossible de récupérer le profil");
        }

        const data = await res.json();
        const me = data?.data || data;

        setUser({
          id: me.id,
          username: me.username,
          role: me.role,
          premiumActive: me.premiumActive || false,
          premiumPlan: me.premiumPlan || null,
          premiumExpires: me.premiumExpires || null,
        });

        // ✅ Message d'accueil automatique
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: WELCOME_MESSAGE,
            createdAt: new Date().toISOString(),
            isWelcome: true,
          },
        ]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [router]);

  // ============================================
  // SCROLL AUTO INTELLIGENT
  // ============================================
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior });
      }, 50);
    },
    [],
  );

  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom("smooth");
    }
  }, [messages.length, scrollToBottom]);

  // Détecte si l'user est proche du bas
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNear = distanceFromBottom < 150;

    isNearBottomRef.current = isNear;
    setShowScrollButton(!isNear && messages.length > 3);
  };

  // ============================================
  // VÉRIFIER L'ACCÈS
  // ============================================
  const canUseOzyra = (): boolean => {
    if (!user) return false;
    if (!user.premiumActive) return false;

    if (user.premiumExpires) {
      const expires = new Date(user.premiumExpires);
      if (expires < new Date()) return false;
    }

    const plan = (user.premiumPlan || "").toUpperCase();
    return (
      plan === "STANDARD" ||
      plan === "PRO" ||
      plan === "PREMIUM" ||
      plan === "MONTHLY" ||
      plan === "YEARLY"
    );
  };

  // ============================================
  // ENVOYER UN MESSAGE
  // ============================================
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    if (!canUseOzyra()) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    const history = messages
      .filter((m) => !m.isWelcome)
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);
    setError("");
    isNearBottomRef.current = true;
    scrollToBottom();

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          history,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(
          data.error || data.reply || "Erreur de communication avec OZYRA",
        );
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply || "Je n'ai pas pu répondre.",
        createdAt: new Date().toISOString(),
        toolsUsed: data.toolsUsed,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message);

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Désolée, je n'arrive pas à répondre pour le moment. Réessaie dans quelques secondes. 😊`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // ============================================
  // NOUVELLE CONVERSATION
  // ============================================
  const handleNewConversation = () => {
    if (confirm("Démarrer une nouvelle conversation ? L'historique sera effacé.")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: WELCOME_MESSAGE,
          createdAt: new Date().toISOString(),
          isWelcome: true,
        },
      ]);
      setError("");
      inputRef.current?.focus();
    }
  };

  // ============================================
  // COPIER UN MESSAGE
  // ============================================
  const handleCopy = async (msgId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  };

  // ============================================
  // RENDU MARKDOWN SIMPLIFIÉ
  // ============================================
  const renderContent = (content: string) => {
    const lines = content.split("\n");

    return lines.map((line, i) => {
      // Titres avec ** **
      const boldedLine = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

      // Puces
      if (line.trim().startsWith("•")) {
        return (
          <div
            key={i}
            className="flex items-start gap-2 my-0.5 pl-1"
            dangerouslySetInnerHTML={{
              __html: `<span class="text-purple-500 shrink-0">•</span><span>${boldedLine.replace(/^•\s*/, "")}</span>`,
            }}
          />
        );
      }

      // Ligne vide
      if (line.trim() === "") {
        return <div key={i} className="h-2" />;
      }

      // Ligne normale
      return (
        <p
          key={i}
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: boldedLine }}
        />
      );
    });
  };

  // ============================================
  // FORMAT
  // ============================================
  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDay = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor(
      (new Date(now.toDateString()).getTime() -
        new Date(d.toDateString()).getTime()) /
        86400000,
    );

    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    if (diff < 7) return `Il y a ${diff} jours`;
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  };

  // ============================================
  // RENDER — CHARGEMENT
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader label="Chargement d'OZYRA..." />
      </div>
    );
  }

  // ============================================
  // RENDER — ERREUR FATALE
  // ============================================
  if (error && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <p className="text-muted-foreground text-center mb-4">{error}</p>
        <Link
          href="/collaborations"
          className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          Retour
        </Link>
      </div>
    );
  }

  // ============================================
  // RENDER — CHAT
  // ============================================
  const hasAccess = canUseOzyra();
  let lastDay = "";

  return (
    <div
      className="flex flex-col h-[100dvh] text-foreground bg-fixed bg-cover bg-center"
      style={{ backgroundImage: `url('${CHAT_BG}')` }}
    >
      {/* HEADER */}
      <header className="shrink-0 z-40 bg-background/70 backdrop-blur-xl border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <Link
            href="/collaborations"
            className="p-2 rounded-full hover:bg-background/40 text-foreground transition-colors shrink-0"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="relative shrink-0">
            <img
              src={OZYRA_AVATAR}
              alt="OZYRA"
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/40"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground truncate">
                OZYRA OPLEX 2.5
              </span>
              <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-emerald-500" />
              Toujours disponible
            </p>
          </div>

          {/* Bouton nouvelle conversation */}
          {messages.length > 1 && (
            <button
              onClick={handleNewConversation}
              className="p-2 rounded-full hover:bg-background/40 text-muted-foreground hover:text-foreground transition-all shrink-0"
              title="Nouvelle conversation"
              aria-label="Nouvelle conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* MESSAGES */}
      <main
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-4 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto">
          <div className="space-y-1">
            {messages.map((msg) => {
              const isMine = msg.role === "user";
              const showDay = formatDay(msg.createdAt) !== lastDay;
              if (showDay) lastDay = formatDay(msg.createdAt);

              return (
                <div key={msg.id} className="animate-message-in">
                  {showDay && (
                    <div className="flex items-center justify-center my-4">
                      <span className="px-3 py-1 rounded-full bg-background/60 backdrop-blur-md border border-border/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {formatDay(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-2 mb-3 ${
                      isMine ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {!isMine && (
                      <img
                        src={OZYRA_AVATAR}
                        alt="OZYRA"
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-purple-500/30 shadow-md"
                      />
                    )}

                    <div
                      className={`max-w-[80%] flex flex-col gap-1 ${
                        isMine ? "items-end" : "items-start"
                      }`}
                    >
                      {msg.content && (
                        <div
                          className={`group relative px-4 py-3 shadow-md transition-all ${
                            isMine
                              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-md"
                              : "bg-background text-foreground border border-border rounded-2xl rounded-bl-md"
                          }`}
                        >
                          {/* Bouton copier au survol (pour OZYRA uniquement) */}
                          {!isMine && msg.content && (
                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-background border border-border shadow-md hover:bg-muted transition-all"
                              title="Copier"
                              aria-label="Copier le message"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3 text-muted-foreground" />
                              )}
                            </button>
                          )}

                          {/* Bordure décorative pour OZYRA */}
                          {!isMine && !msg.isWelcome && (
                            <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                          )}

                          <div className="text-sm whitespace-pre-wrap break-words">
                            {renderContent(msg.content)}
                          </div>
                        </div>
                      )}

                      <div
                        className={`flex items-center gap-1 px-2 ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span className="text-[9px] text-muted-foreground">
                          {formatTime(msg.createdAt)}
                        </span>
                        {isMine && (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Indicateur de frappe */}
            {sending && (
              <div className="flex items-end gap-2 mb-3 animate-message-in">
                <img
                  src={OZYRA_AVATAR}
                  alt="OZYRA"
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-purple-500/30 shadow-md"
                />
                <div className="bg-background text-foreground border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      OZYRA écrit
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>
        </div>
      </main>

      {/* BOUTON RETOUR EN BAS */}
      {showScrollButton && (
        <button
          onClick={() => {
            isNearBottomRef.current = true;
            scrollToBottom("smooth");
          }}
          className="absolute bottom-32 right-4 z-30 p-2.5 rounded-full bg-background border border-border shadow-lg hover:bg-muted transition-all animate-fade-in"
          aria-label="Descendre"
        >
          <ChevronDown className="w-5 h-5 text-foreground" />
        </button>
      )}

      {/* INPUT OU BLOCAGE */}
      {hasAccess ? (
        <form
          onSubmit={handleSend}
          className="shrink-0 bg-background/70 backdrop-blur-xl border-t border-border/40 px-3 py-3"
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écris à OZYRA..."
              maxLength={2000}
              disabled={sending}
              className="flex-1 px-4 py-3 rounded-full bg-background border border-border text-foreground placeholder-muted-foreground focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm transition-all disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="p-3 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-purple-600/30 active:scale-95"
              aria-label="Envoyer"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <OzyraBlocked />
      )}

      <style jsx>{`
        @keyframes message-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-message-in {
          animation: message-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out both;
        }

        /* Scrollbar custom */
        main::-webkit-scrollbar {
          width: 6px;
        }
        main::-webkit-scrollbar-track {
          background: transparent;
        }
        main::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }
        main::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
