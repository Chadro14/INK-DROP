"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  BadgeCheck,
  MessageCircle,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";
const POLL_INTERVAL = 3000;

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // ============================================
  // RÉCUPÉRER L'ID UTILISATEUR (une fois)
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
      }
    } catch (e) {
      console.error("Erreur parsing user:", e);
    }
  }, [router]);

  // ============================================
  // CHARGER LA CONVERSATION (une fois)
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
  // CHARGER LES MESSAGES + POLLING
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

      // Détecter un nouveau message
      const lastId = newMessages[newMessages.length - 1]?.id || null;
      const hasNew = lastId && lastId !== lastMessageIdRef.current;
      lastMessageIdRef.current = lastId;

      setMessages(newMessages);

      // Scroll en bas seulement si nouveau message ou initial
      if (isInitial || hasNew) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: isInitial ? "auto" : "smooth" });
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

    // Polling toutes les 3s
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

    // Optimistic : ajouter un message temporaire
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUserId || "",
      receiverId: conversation?.otherUser.id || "",
      conversationId,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUserId || "",
        username: "Vous",
        avatarUrl: null,
        avatarColor: "#8B5CF6",
        isCertified: false,
        badgeColor: null,
      },
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

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

      // Recharger immédiatement pour avoir le vrai message
      await fetchMessages(false);
    } catch (err: any) {
      setError(err.message);
      // Retirer le message optimiste
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  // ============================================
  // FORMAT DATE
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
      (new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) /
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
          className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all"
        >
          Retour aux collaborations
        </Link>
      </div>
    );
  }

  // Grouper les messages par jour
  let lastDay = "";

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <Link
            href="/collaborations"
            className="p-2 rounded-full hover:bg-card text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {conversation && (
            <>
              {conversation.otherUser.avatarUrl ? (
                <img
                  src={conversation.otherUser.avatarUrl}
                  alt={conversation.otherUser.username}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: conversation.otherUser.avatarColor || "#8B5CF6" }}
                >
                  {conversation.otherUser.username?.charAt(0).toUpperCase() || "?"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <Link
                  href={`/creator/${conversation.otherUser.username}`}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  <span className="text-sm font-bold text-foreground truncate">
                    @{conversation.otherUser.username}
                  </span>
                  {conversation.otherUser.isCertified && (
                    <BadgeCheck
                      className="w-4 h-4 shrink-0"
                      fill={conversation.otherUser.badgeColor || conversation.otherUser.avatarColor || "#3B82F6"}
                      color="black"
                      strokeWidth={1.5}
                    />
                  )}
                </Link>
                <p className="text-[10px] text-muted-foreground">
                  Collaboration active
                </p>
              </div>
            </>
          )}
        </div>
      </header>

      {/* MESSAGES */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">
              Aucun message pour l'instant
            </p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Commencez la conversation
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg) => {
              const isMine = msg.senderId === currentUserId;
              const showDay = formatDay(msg.createdAt) !== lastDay;
              if (showDay) lastDay = formatDay(msg.createdAt);

              return (
                <div key={msg.id}>
                  {showDay && (
                    <div className="flex items-center justify-center my-4">
                      <span className="px-3 py-1 rounded-full bg-card border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {formatDay(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}
                  >
                    <div
                      className={`max-w-[75%] px-3.5 py-2 rounded-2xl ${
                        isMine
                          ? "bg-purple-600 text-white rounded-br-sm"
                          : "bg-card border border-border text-foreground rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p
                        className={`text-[9px] mt-1 ${
                          isMine ? "text-white/70" : "text-muted-foreground"
                        } text-right`}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* INPUT */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-0 bg-background border-t border-border px-4 py-3 pb-20 md:pb-3"
      >
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrire un message..."
            maxLength={2000}
            className="flex-1 px-4 py-2.5 rounded-full bg-card border border-border text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none text-sm transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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

      <BottomNav />
    </div>
  );
}
