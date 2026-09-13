"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  BadgeCheck,
  MessageCircle,
  Check,
  CheckCheck,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";
const POLL_INTERVAL = 3000;
const CHAT_BG = "https://files.catbox.moe/guzb7f.png";

type ChatUser = {
  id: string;
  username: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  isCertified: boolean;
  badgeColor: string | null;
};

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  conversationId: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: ChatUser;
};

type ConversationInfo = {
  id: string;
  otherUser: ChatUser;
  createdAt: string;
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params?.id as string;

  const [conversation, setConversation] = useState<ConversationInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ============================================
  // IDENTIFIER L'UTILISATEUR
  // ============================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        setCurrentUserId(u?.id || null);
        setCurrentUser(u);
      }
    } catch (e) {
      console.error("Erreur parsing user:", e);
    }
  }, [router]);

  // ============================================
  // CHARGER LA CONVERSATION
  // ============================================
  useEffect(() => {
    const fetchConversation = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(
          `${API_URL}/collaborations/conversations/${conversationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Conversation introuvable");

        const data = await res.json();
        setConversation(data.data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (conversationId) fetchConversation();
  }, [conversationId]);

  // ============================================
  // CHARGER LES MESSAGES
  // ============================================
  const fetchMessages = async (isInitial = false) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        `${API_URL}/messages/conversations/${conversationId}?page=1&limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Erreur de chargement");

      const data = await res.json();
      const newMessages: Message[] = data.data || [];

      const prevLastId = lastMessageIdRef.current;
      const newLastId = newMessages[newMessages.length - 1]?.id || null;
      const hasNew = newLastId && newLastId !== prevLastId;

      lastMessageIdRef.current = newLastId;

      setMessages((prev) => {
        const temps = prev.filter((m) => m.id.startsWith("temp-"));
        const stillPending = temps.filter(
          (t) =>
            !newMessages.some(
              (c) => c.content === t.content && c.senderId === t.senderId
            )
        );
        return [...newMessages, ...stillPending];
      });

      if ((isInitial || hasNew) && scrollContainerRef.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: isInitial ? "auto" : "smooth",
          });
        }, 50);
      }
    } catch (err: any) {
      if (isInitial) setError(err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationId) return;

    fetchMessages(true);

    pollingRef.current = setInterval(() => {
      fetchMessages(false);
    }, POLL_INTERVAL);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // ============================================
  // ENVOYER UN MESSAGE
  // ============================================
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const content = input.trim();
    setInput("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUserId || "",
      receiverId: conversation?.otherUser.id || "",
      conversationId,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: currentUser || {
        id: currentUserId || "",
        username: "Vous",
        avatarUrl: null,
        avatarColor: "#8B5CF6",
        isCertified: false,
        badgeColor: null,
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );

    try {
      const res = await fetch(
        `${API_URL}/messages/conversations/${conversationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur d'envoi");
      }

      const serverData = await res.json();
      const realMessage: Message | undefined = serverData.data;

      if (realMessage) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? realMessage : m))
        );
        lastMessageIdRef.current = realMessage.id;
      } else {
        await fetchMessages(false);
      }

      inputRef.current?.focus();
    } catch (err: any) {
      setError(err.message);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(content);
    } finally {
      setSending(false);
    }
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
        86400000
    );

    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    if (diff < 7) return `Il y a ${diff} jours`;
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  };

  const renderAvatar = (user: ChatUser | null, size = "w-8 h-8") => {
    if (!user) return null;
    if (user.avatarUrl) {
      return (
        <img
          src={user.avatarUrl}
          alt={user.username}
          className={`${size} rounded-full object-cover shrink-0`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}
        style={{ backgroundColor: user.avatarColor || "#8B5CF6" }}
      >
        {user.username?.charAt(0).toUpperCase() || "?"}
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader label="Chargement de la conversation..." />
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <p className="text-muted-foreground text-center mb-4">
          {error || "Conversation introuvable"}
        </p>
        <Link
          href="/collaborations"
          className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
        >
          Retour aux collaborations
        </Link>
      </div>
    );
  }

  let lastDay = "";
  let lastSenderId = "";

  return (
    <div className="flex flex-col h-[100dvh] text-foreground relative overflow-hidden">
      {/* FOND IMAGE PLEIN ÉCRAN */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `url('${CHAT_BG}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* HEADER — TRANSPARENT + BLUR */}
      <header
        className="shrink-0 z-40 border-b border-white/10 px-4 py-3"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <Link
            href="/collaborations"
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors shrink-0"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {conversation && (
            <>
              {renderAvatar(conversation.otherUser, "w-10 h-10")}

              <div className="flex-1 min-w-0">
                <Link
                  href={`/creator/${conversation.otherUser.username}`}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  <span className="text-sm font-bold text-white truncate">
                    @{conversation.otherUser.username}
                  </span>
                  {conversation.otherUser.isCertified && (
                    <BadgeCheck
                      className="w-4 h-4 shrink-0"
                      fill={
                        conversation.otherUser.badgeColor ||
                        conversation.otherUser.avatarColor ||
                        "#3B82F6"
                      }
                      color="black"
                      strokeWidth={1.5}
                    />
                  )}
                </Link>
              </div>
            </>
          )}
        </div>
      </header>

      {/* MESSAGES — sur le fond image, sans overlay */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 py-4 relative"
      >
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-medium text-sm drop-shadow">
                Aucun message pour l'instant
              </p>
              <p className="text-white/70 text-xs mt-1 drop-shadow">
                Commencez la conversation
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                const showDay = formatDay(msg.createdAt) !== lastDay;
                const showAvatar = !isMine && msg.senderId !== lastSenderId;
                if (showDay) lastDay = formatDay(msg.createdAt);
                lastSenderId = msg.senderId;

                return (
                  <div key={msg.id} className="animate-message-in">
                    {showDay && (
                      <div className="flex items-center justify-center my-4">
                        <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
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
                        <div className="w-8 shrink-0">
                          {showAvatar ? renderAvatar(msg.sender, "w-8 h-8") : null}
                        </div>
                      )}

                      <div
                        className={`max-w-[75%] px-3.5 py-2 shadow-lg ${
                          isMine
                            ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                            : "bg-black/70 backdrop-blur-md text-white border border-white/10 rounded-2xl rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {msg.content}
                        </p>
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span
                            className={`text-[9px] ${
                              isMine ? "text-white/70" : "text-white/60"
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </span>
                          {isMine && (
                            <span className="text-white/70">
                              {msg.isRead ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>
          )}
        </div>
      </main>

      {/* INPUT — TRANSPARENT + BLUR */}
      <form
        onSubmit={handleSend}
        className="shrink-0 z-40 border-t border-white/10 px-3 py-3"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrire un message..."
            maxLength={2000}
            className="flex-1 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/60 focus:border-blue-400 focus:bg-white/15 outline-none text-sm transition-all backdrop-blur-md"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-blue-600/30"
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

      <style jsx>{`
        @keyframes message-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-message-in {
          animation: message-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}
