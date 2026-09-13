"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  MessageCircle,
  Users,
  Check,
  X,
  Clock,
  Loader2,
  AlertCircle,
  BadgeCheck,
  Inbox,
  Send,
  Ban,
  CheckCircle2,
  XCircle,
  Lock,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type CollabUser = {
  id: string;
  username: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  isCertified: boolean;
  badgeColor: string | null;
};

type CollaborationRequest = {
  id: string;
  senderId: string;
  receiverId: string;
  sender?: CollabUser;
  receiver?: CollabUser;
  amountManas: number;
  message: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED";
  respondedAt: string | null;
  expiresAt: string;
  refundedAt: string | null;
  createdAt: string;
};

type Conversation = {
  id: string;
  otherUser: CollabUser;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  collaboration: {
    id: string;
    amountManas: number;
    createdAt: string;
  };
};

export default function CollaborationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"requests" | "conversations">(
    "requests"
  );

  const [received, setReceived] = useState<CollaborationRequest[]>([]);
  const [sent, setSent] = useState<CollaborationRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [recRes, sentRes, convRes] = await Promise.all([
          fetch(`${API_URL}/collaborations/received`, { headers }),
          fetch(`${API_URL}/collaborations/sent`, { headers }),
          fetch(`${API_URL}/collaborations/conversations`, { headers }),
        ]);

        if (recRes.ok) {
          const d = await recRes.json();
          setReceived(d.data || []);
        }
        if (sentRes.ok) {
          const d = await sentRes.json();
          setSent(d.data || []);
        }
        if (convRes.ok) {
          const d = await convRes.json();
          setConversations(d.data || []);
        }
      } catch (err: any) {
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [router]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const handleAccept = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setProcessingId(id);

    try {
      const res = await fetch(`${API_URL}/collaborations/${id}/accept`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      setReceived((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "ACCEPTED", respondedAt: new Date().toISOString() } : r
        )
      );
      setMessage("Collaboration acceptée");

      // Recharger les conversations
      const convRes = await fetch(`${API_URL}/collaborations/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (convRes.ok) {
        const d = await convRes.json();
        setConversations(d.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setProcessingId(id);

    try {
      const res = await fetch(`${API_URL}/collaborations/${id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      setReceived((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "REJECTED", respondedAt: new Date().toISOString() } : r
        )
      );
      setMessage("Demande refusée — MANAS remboursés");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setProcessingId(id);

    try {
      const res = await fetch(`${API_URL}/collaborations/${id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      setSent((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "CANCELLED", respondedAt: new Date().toISOString() } : r
        )
      );
      setMessage("Demande annulée — MANAS remboursés");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: CollaborationRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return {
          label: "En attente",
          icon: Clock,
          className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        };
      case "ACCEPTED":
        return {
          label: "Acceptée",
          icon: CheckCircle2,
          className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        };
      case "REJECTED":
        return {
          label: "Refusée",
          icon: XCircle,
          className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
        };
      case "EXPIRED":
        return {
          label: "Expirée",
          icon: Clock,
          className: "bg-muted text-muted-foreground border-border",
        };
      case "CANCELLED":
        return {
          label: "Annulée",
          icon: Ban,
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
    return d.toLocaleDateString("fr-FR");
  };

  const renderAvatar = (user: CollabUser, size = "w-10 h-10") => {
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
        className={`${size} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}
        style={{ backgroundColor: user.avatarColor || "#8B5CF6" }}
      >
        {user.username?.charAt(0).toUpperCase() || "?"}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader label="Chargement des collaborations..." />
      </div>
    );
  }

  const pendingReceived = received.filter((r) => r.status === "PENDING");
  const pendingSent = sent.filter((r) => r.status === "PENDING");
  const totalPending = pendingReceived.length + pendingSent.length;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-24">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link
            href="/profile"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
          <span className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-500" />
            Collaborations
          </span>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 md:px-8 py-6 flex flex-col gap-4">
        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-sm flex items-center gap-2 animate-slide-down">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-sm flex items-center gap-2 animate-slide-down">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ONGLETS */}
        <div className="flex border-b border-border/80 w-full mb-2">
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 text-center text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "requests"
                ? "border-purple-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Demandes {totalPending > 0 && `(${totalPending})`}</span>
          </button>
          <button
            onClick={() => setActiveTab("conversations")}
            className={`flex-1 py-3 text-center text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === "conversations"
                ? "border-purple-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Conversations ({conversations.length})</span>
          </button>
        </div>

        {/* ===== ONGLET DEMANDES ===== */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            {/* REÇUES */}
            <div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Inbox className="w-3.5 h-3.5" />
                Demandes reçues ({received.length})
              </h2>

              {received.length === 0 ? (
                <div className="text-center py-10 bg-card/40 rounded-2xl border border-border/60">
                  <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Aucune demande reçue
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {received.map((req, index) => {
                    const sender = req.sender;
                    const statusBadge = getStatusBadge(req.status);
                    const StatusIcon = statusBadge.icon;
                    const isPending = req.status === "PENDING";

                    return (
                      <div
                        key={req.id}
                        style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
                        className={`bg-card/60 border rounded-2xl p-4 animate-notif-in ${
                          isPending
                            ? "border-purple-500/40 bg-purple-500/5"
                            : "border-border/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {sender && renderAvatar(sender)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-bold text-foreground truncate">
                                @{sender?.username || "utilisateur"}
                              </span>
                              {sender?.isCertified && (
                                <BadgeCheck
                                  className="w-3.5 h-3.5"
                                  fill={sender.badgeColor || sender.avatarColor || "#3B82F6"}
                                  color="black"
                                  strokeWidth={1.5}
                                />
                              )}
                              <span
                                className={`ml-auto px-2 py-0.5 rounded-full border text-[9px] font-bold flex items-center gap-1 ${statusBadge.className}`}
                              >
                                <StatusIcon className="w-2.5 h-2.5" />
                                {statusBadge.label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(req.createdAt)}
                            </p>

                            {req.message && (
                              <p className="text-sm text-foreground/90 mt-2 italic">
                                "{req.message}"
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/30">
                                {req.amountManas} MANAS
                              </span>
                            </div>

                            {isPending && (
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleAccept(req.id)}
                                  disabled={processingId === req.id}
                                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                  {processingId === req.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      Accepter
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  disabled={processingId === req.id}
                                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                  {processingId === req.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <X className="w-3.5 h-3.5" />
                                      Refuser
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ENVOYÉES */}
            <div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Send className="w-3.5 h-3.5" />
                Demandes envoyées ({sent.length})
              </h2>

              {sent.length === 0 ? (
                <div className="text-center py-10 bg-card/40 rounded-2xl border border-border/60">
                  <Send className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Aucune demande envoyée
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sent.map((req, index) => {
                    const receiver = req.receiver;
                    const statusBadge = getStatusBadge(req.status);
                    const StatusIcon = statusBadge.icon;
                    const isPending = req.status === "PENDING";

                    return (
                      <div
                        key={req.id}
                        style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
                        className={`bg-card/60 border border-border/60 rounded-2xl p-4 animate-notif-in`}
                      >
                        <div className="flex items-start gap-3">
                          {receiver && renderAvatar(receiver)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-bold text-foreground truncate">
                                @{receiver?.username || "utilisateur"}
                              </span>
                              {receiver?.isCertified && (
                                <BadgeCheck
                                  className="w-3.5 h-3.5"
                                  fill={receiver.badgeColor || receiver.avatarColor || "#3B82F6"}
                                  color="black"
                                  strokeWidth={1.5}
                                />
                              )}
                              <span
                                className={`ml-auto px-2 py-0.5 rounded-full border text-[9px] font-bold flex items-center gap-1 ${statusBadge.className}`}
                              >
                                <StatusIcon className="w-2.5 h-2.5" />
                                {statusBadge.label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(req.createdAt)}
                            </p>

                            {req.message && (
                              <p className="text-sm text-foreground/90 mt-2 italic">
                                "{req.message}"
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/30">
                                {req.amountManas} MANAS
                              </span>
                            </div>

                            {isPending && (
                              <button
                                onClick={() => handleCancel(req.id)}
                                disabled={processingId === req.id}
                                className="mt-3 w-full py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 border border-border"
                              >
                                {processingId === req.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Ban className="w-3.5 h-3.5" />
                                    Annuler la demande
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ONGLET CONVERSATIONS ===== */}
        {activeTab === "conversations" && (
          <div>
            {conversations.length === 0 ? (
              <div className="text-center py-16 bg-card/40 rounded-2xl border border-border/60">
                <MessageCircle className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  Aucune conversation
                </p>
                <p className="text-muted-foreground/70 text-xs mt-1">
                  Acceptez une demande pour commencer à discuter
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv, index) => (
                  <Link
                    key={conv.id}
                    href={`/chat/${conv.id}`}
                    style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
                    className="block bg-card/60 border border-border/60 rounded-2xl p-4 hover:border-purple-500/40 hover:bg-card transition-all animate-notif-in"
                  >
                    <div className="flex items-center gap-3">
                      {renderAvatar(conv.otherUser, "w-12 h-12")}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-foreground truncate">
                            @{conv.otherUser.username}
                          </span>
                          {conv.otherUser.isCertified && (
                            <BadgeCheck
                              className="w-3.5 h-3.5 shrink-0"
                              fill={conv.otherUser.badgeColor || conv.otherUser.avatarColor || "#3B82F6"}
                              color="black"
                              strokeWidth={1.5}
                            />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.lastMessagePreview || "Nouvelle conversation"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {conv.lastMessageAt && (
                          <p className="text-[10px] text-muted-foreground">
                            {formatDate(conv.lastMessageAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />

      <style jsx>{`
        @keyframes notif-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-notif-in {
          animation: notif-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-slide-down {
          animation: slide-down 0.25s ease-out both;
        }
      `}</style>
    </div>
  );
}
