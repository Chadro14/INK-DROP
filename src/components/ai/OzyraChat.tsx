"use client";

import { useEffect, useState, useRef } from "react";
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
  Check,
  CheckCheck,
  Zap,
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
};

type UserInfo = {
  id: string;
  username: string;
  role: string;
  premiumActive: boolean;
  premiumPlan: string | null;
  premiumExpires: string | null;
};

export function OzyraChat() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserInfo | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [router]);

  // ============================================
  // SCROLL AUTO
  // ============================================
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom("auto");
  }, [messages.length]);

  // ============================================
  // VÉRIFIER SI L'USER PEUT UTILISER OZYRA
  // ============================================
  const canUseOzyra = (): boolean => {
    if (!user) return false;
    if (!user.premiumActive) return false;
    const plan = (user.premiumPlan || "").toUpperCase();
    return plan === "PRO" || plan === "PREMIUM";
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

    // Historique à envoyer (10 derniers messages)
    const history = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);
    setError("");
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

      // Message d'erreur d'OZYRA
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
  // FORMAT HEURE
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
      <header className="shrink-0 z-40 bg-background/60 backdrop-blur-xl border-b border-border/40 px-4 py-3">
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
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
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
        </div>
      </header>

      {/* MESSAGES */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 py-4"
      >
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-4">
                <img
                  src={OZYRA_AVATAR}
                  alt="OZYRA"
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/40 shadow-xl shadow-purple-500/20"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center border-2 border-background">
                  <Sparkles className="w-3 h-3 text-white" />
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-foreground mb-1">
                OZYRA OPLEX 2.5
              </h2>
              <p className="text-xs text-muted-foreground max-w-xs mb-4">
                Bonjour {user?.username}, je suis OZYRA. Je peux t'aider à
                découvrir des mangas, comprendre INKDROP, ou te conseiller sur
                ta création.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {[
                  "Quel est le meilleur manga ?",
                  "Comment gagner de l'argent avec mes mangas ?",
                  "Combien j'ai de MANAS ?",
                  "Cherche un manga d'aventure",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    disabled={!hasAccess}
                    className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border text-[11px] font-medium text-foreground hover:border-purple-500/40 hover:bg-background transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg) => {
                const isMine = msg.role === "user";
                const showDay = formatDay(msg.createdAt) !== lastDay;
                if (showDay) lastDay = formatDay(msg.createdAt);

                return (
                  <div key={msg.id} className="animate-message-in">
                    {showDay && (
                      <div className="flex items-center justify-center my-4">
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/20 to-amber-600/20 backdrop-blur-md border border-purple-500/30 text-[10px] font-bold text-foreground uppercase tracking-wider">
                          {formatDay(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex items-end gap-2 mb-1 ${
                        isMine ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {!isMine && (
                        <img
                          src={OZYRA_AVATAR}
                          alt="OZYRA"
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-purple-500/30"
                        />
                      )}

                      <div
                        className={`max-w-[75%] flex flex-col gap-1 ${
                          isMine ? "items-end" : "items-start"
                        }`}
                      >
                        {msg.content && (
                          <div
                            className={`px-3.5 py-2 shadow-md ${
                              isMine
                                ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-sm"
                                : "bg-background text-foreground border border-border border-l-2 border-l-purple-500/60 rounded-2xl rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {msg.content}
                            </p>
                          </div>
                        )}

                        <div
                          className={`flex items-center gap-1 px-1 ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-[9px] text-white/80 drop-shadow">
                            {formatTime(msg.createdAt)}
                          </span>
                          {isMine && (
                            <span className="text-white/80 drop-shadow">
                              <CheckCheck className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex items-end gap-2 mb-1">
                  <img
                    src={OZYRA_AVATAR}
                    alt="OZYRA"
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-purple-500/30"
                  />
                  <div className="bg-background text-foreground border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-md">
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
              )}

              <div ref={messagesEndRef} className="h-2" />
            </div>
          )}
        </div>
      </main>

      {/* INPUT OU BLOCAGE */}
      {hasAccess ? (
        <form
          onSubmit={handleSend}
          className="shrink-0 bg-background/60 backdrop-blur-xl border-t border-border/40 px-3 py-3"
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
              className="flex-1 px-4 py-2.5 rounded-full bg-background/80 border border-border text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none text-sm transition-all disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="p-2.5 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-purple-600/20"
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
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-message-in {
          animation: message-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}
