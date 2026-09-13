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
  BookOpen,
  Plus,
  X,
  Search,
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

type MangaPreview = {
  id: string;
  title: string;
  slug: string | null;
  coverUrl: string | null;
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
  manga: MangaPreview | null;
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

  // Manga partagé
  const [attachedManga, setAttachedManga] = useState<MangaPreview | null>(null);
  const [showMangaModal, setShowMangaModal] = useState(false);
  const [myMangas, setMyMangas] = useState<MangaPreview[]>([]);
  const [loadingMangas, setLoadingMangas] = useState(false);
  const [mangaSearch, setMangaSearch] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ============================================
  // RÉCUPÉRER L'UTILISATEUR VIA /users/me
  // ============================================
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
            return;
          }
          throw new Error("Impossible de récupérer le profil");
        }

        const data = await res.json();
        const user = data?.data || data;

        setCurrentUserId(user?.id || null);
        setCurrentUser({
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl || null,
          avatarColor: user.avatarColor || null,
          isCertified: user.isCertified || false,
          badgeColor: user.badgeColor || null,
        });
      } catch (err) {
        console.error("Erreur fetchMe:", err);
      }
    };

    fetchMe();
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
  // CHARGER MES MANGAS (via /users/me)
  // ============================================
  const loadMyMangas = async () => {
    setLoadingMangas(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingMangas(false);
        return;
      }

      let myUserId = currentUserId;

      if (!myUserId) {
        const meRes = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!meRes.ok) {
          throw new Error("Impossible de récupérer le profil");
        }

        const meData = await meRes.json();
        const me = meData?.data || meData;
        myUserId = me?.id || null;

        if (!myUserId) throw new Error("ID utilisateur introuvable");
        setCurrentUserId(myUserId);
      }

      const res = await fetch(`${API_URL}/mangas/creator/${myUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const list = data.data || [];
        setMyMangas(
          list.map((m: any) => ({
            id: m.id,
            title: m.title,
            slug: m.slug || null,
            coverUrl: m.coverUrl || null,
          }))
        );
      } else {
        console.error("Erreur chargement mangas:", res.status);
      }
    } catch (err) {
      console.error("Erreur chargement mangas:", err);
    } finally {
      setLoadingMangas(false);
    }
  };

  const openMangaModal = () => {
    setShowMangaModal(true);
    if (myMangas.length === 0) {
      loadMyMangas();
    }
  };

  // ============================================
  // ENVOYER UN MESSAGE
  // ============================================
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedManga) || sending) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const content = input.trim();
    const mangaToSend = attachedManga;

    setInput("");
    setAttachedManga(null);
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
      manga: mangaToSend,
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
          body: JSON.stringify({
            content,
            mangaId: mangaToSend?.id || undefined,
          }),
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
      setAttachedManga(mangaToSend);
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

  const filteredMangas = myMangas.filter((m) =>
    m.title.toLowerCase().includes(mangaSearch.toLowerCase())
  );

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

          {conversation && (
            <>
              <Link href={`/creator/${conversation.otherUser.username}`}>
                {renderAvatar(conversation.otherUser, "w-10 h-10")}
              </Link>

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

      {/* MESSAGES */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 py-4"
      >
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-medium text-sm drop-shadow-lg">
                Aucun message pour l'instant
              </p>
              <p className="text-white/80 text-xs mt-1 drop-shadow-lg">
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
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-blue-500/30 text-[10px] font-bold text-foreground uppercase tracking-wider">
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
                        className={`max-w-[75%] flex flex-col gap-1 ${
                          isMine ? "items-end" : "items-start"
                        }`}
                      >
                        {/* CARTE MANGA */}
                        {msg.manga && (
                          <Link
                            href={`/manga/${msg.manga.slug || msg.manga.id}`}
                            className={`w-56 rounded-2xl overflow-hidden border shadow-md hover:scale-[1.02] transition-transform ${
                              isMine ? "border-blue-400/40" : "border-border"
                            }`}
                          >
                            {msg.manga.coverUrl ? (
                              <img
                                src={msg.manga.coverUrl}
                                alt={msg.manga.title}
                                className="w-full h-32 object-cover"
                              />
                            ) : (
                              <div className="w-full h-32 bg-muted flex items-center justify-center">
                                <BookOpen className="w-8 h-8 text-muted-foreground/40" />
                              </div>
                            )}
                            <div
                              className={`px-3 py-2 ${
                                isMine
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                  : "bg-background text-foreground"
                              }`}
                            >
                              <p className="text-xs font-bold truncate">
                                {msg.manga.title}
                              </p>
                              <p
                                className={`text-[10px] mt-0.5 ${
                                  isMine
                                    ? "text-white/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                Appuyez pour lire →
                              </p>
                            </div>
                          </Link>
                        )}

                        {/* TEXTE */}
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

                        {/* HEURE + STATUT */}
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

      {/* APERÇU MANGA ATTACHÉ */}
      {attachedManga && (
        <div className="shrink-0 bg-background/80 backdrop-blur-xl border-t border-border/40 px-3 pt-2 animate-slide-up">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-2 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30">
              {attachedManga.coverUrl ? (
                <img
                  src={attachedManga.coverUrl}
                  alt={attachedManga.title}
                  className="w-8 h-8 rounded object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-muted-foreground/60" />
                </div>
              )}
              <span className="text-xs font-bold text-foreground truncate max-w-[200px]">
                {attachedManga.title}
              </span>
              <button
                type="button"
                onClick={() => setAttachedManga(null)}
                className="p-1 rounded-full hover:bg-background/60 text-muted-foreground hover:text-foreground transition-all shrink-0"
                aria-label="Retirer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INPUT */}
      <form
        onSubmit={handleSend}
        className="shrink-0 bg-background/60 backdrop-blur-xl border-t border-border/40 px-3 py-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <button
            type="button"
            onClick={openMangaModal}
            className={`p-2.5 rounded-full border transition-all duration-300 shrink-0 group ${
              showMangaModal
                ? "bg-gradient-to-br from-blue-600 to-purple-600 border-blue-500 text-white rotate-45 scale-95 shadow-lg shadow-blue-600/30"
                : "bg-background/80 border-border text-muted-foreground hover:text-blue-500 hover:border-blue-500/40 hover:scale-105 active:scale-95"
            }`}
            aria-label="Partager un manga"
          >
            <Plus className="w-5 h-5 transition-transform duration-300" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrire un message..."
            maxLength={2000}
            className="flex-1 px-4 py-2.5 rounded-full bg-background/80 border border-border text-foreground placeholder-muted-foreground focus:border-blue-500 outline-none text-sm transition-all"
          />

          <button
            type="submit"
            disabled={(!input.trim() && !attachedManga) || sending}
            className="p-2.5 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-blue-600/20"
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

      {/* MODAL DE SÉLECTION DE MANGA */}
      {showMangaModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-modal-backdrop"
          onClick={() => setShowMangaModal(false)}
        >
          <div
            className="bg-background border-t md:border border-border/60 rounded-t-3xl md:rounded-2xl w-full md:max-w-md max-h-[75vh] flex flex-col overflow-hidden shadow-2xl animate-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER MODAL */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 shrink-0">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Partager un manga
              </h3>
              <button
                onClick={() => setShowMangaModal(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* RECHERCHE */}
            <div className="px-4 py-3 border-b border-border/60 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={mangaSearch}
                  onChange={(e) => setMangaSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-border text-foreground placeholder-muted-foreground focus:border-blue-500 outline-none text-sm transition-all"
                />
              </div>
            </div>

            {/* LISTE */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loadingMangas ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm">Chargement de vos mangas...</span>
                </div>
              ) : myMangas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground text-sm font-medium">
                    Aucun manga publié
                  </p>
                  <Link
                    href="/creator/upload"
                    className="mt-3 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                  >
                    Publier un manga
                  </Link>
                </div>
              ) : filteredMangas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Aucun résultat pour "{mangaSearch}"
                </div>
              ) : (
                filteredMangas.map((manga) => (
                  <button
                    key={manga.id}
                    type="button"
                    onClick={() => {
                      setAttachedManga(manga);
                      setShowMangaModal(false);
                      setMangaSearch("");
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-xl bg-card hover:bg-muted border border-border/60 hover:border-blue-500/40 transition-all text-left hover:scale-[1.01]"
                  >
                    {manga.coverUrl ? (
                      <img
                        src={manga.coverUrl}
                        alt={manga.title}
                        className="w-12 h-16 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {manga.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Appuyez pour attacher
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
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

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes modal-backdrop {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-modal-backdrop {
          animation: modal-backdrop 0.2s ease-out both;
        }

        @keyframes modal-panel {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-modal-panel {
          animation: modal-panel 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (max-width: 768px) {
          @keyframes modal-panel {
            from {
              opacity: 0;
              transform: translateY(100%);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
      `}</style>
    </div>
  );
}
