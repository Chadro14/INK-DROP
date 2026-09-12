"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  AlertCircle,
  Check,
  Clock,
  Trophy,
  Crown,
  Coins,
  Sparkles,
  Users,
  BookOpen,
  Heart,
  MessageCircle,
  BadgeCheck,
  X,
} from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type NotificationUser = {
  id: string;
  username: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  isCertified: boolean;
  badgeColor: string | null;
};

type Notification = {
  id: string;
  userId: string;
  fromUserId: string | null;
  fromUser: NotificationUser | null;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  metadata: any;
  createdAt: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [clickingId, setClickingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/notifications?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erreur de chargement");

        const data = await res.json();
        setNotifications(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [router]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 2500);
    return () => clearTimeout(t);
  }, [message]);

  const getFilteredNotifications = () => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  };

  const markAsRead = async (notificationId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur");

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Erreur marquage comme lu:", err);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur");

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setMessage("Toutes les notifications ont été marquées comme lues");
    } catch (err) {
      console.error("Erreur marquage tout comme lu:", err);
    }
  };

  const deleteNotification = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return;

    // Animation de sortie immédiate
    setDeletingIds((prev) => [...prev, notificationId]);

    try {
      const res = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur");

      // Attendre la fin de l'animation avant de retirer du DOM
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        );
        setDeletingIds((prev) => prev.filter((id) => id !== notificationId));
        setMessage("Notification supprimée");
      }, 300);
    } catch (err) {
      console.error("Erreur suppression:", err);
      setDeletingIds((prev) => prev.filter((id) => id !== notificationId));
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (clickingId === notification.id) return;
    setClickingId(notification.id);

    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.link) {
      setTimeout(() => {
        router.push(notification.link!);
      }, 150);
    } else {
      setTimeout(() => setClickingId(null), 300);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "NEW_CHAPTER":
        return BookOpen;
      case "NEW_COMMENT":
        return MessageCircle;
      case "NEW_SUBSCRIBER":
        return Users;
      case "NEW_LIKE":
        return Heart;
      case "EARNING":
        return Coins;
      case "CERTIFICATION":
        return Crown;
      case "PREMIUM_EXPIRY":
        return Clock;
      case "EVENT_STARTED":
      case "EVENT_ENDED":
      case "EVENT_REWARD":
      case "EVENT_REMINDER":
        return Trophy;
      case "REEL_MENTION":
        return Sparkles;
      default:
        return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "NEW_CHAPTER":
        return "bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30";
      case "NEW_COMMENT":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "NEW_SUBSCRIBER":
        return "bg-purple-500/15 text-purple-500 dark:text-purple-400 border-purple-500/30";
      case "NEW_LIKE":
        return "bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30";
      case "EARNING":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "CERTIFICATION":
        return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
      case "PREMIUM_EXPIRY":
        return "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30";
      case "EVENT_STARTED":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "EVENT_ENDED":
        return "bg-muted text-muted-foreground border-border";
      case "EVENT_REWARD":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "EVENT_REMINDER":
        return "bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30";
      case "REEL_MENTION":
        return "bg-violet-500/15 text-violet-500 dark:text-violet-400 border-violet-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return new Date(date).toLocaleDateString("fr-FR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader label="Chargement des notifications..." />
      </div>
    );
  }

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
            <Bell className="w-5 h-5 text-blue-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
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

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === "unread"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              Non lues {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-xl bg-card hover:bg-muted text-foreground text-sm font-medium transition-all border border-border flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Tout lire
            </button>
          )}
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-card/40 rounded-2xl border border-border/60 animate-fade-in">
            <Bell className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              {filter === "unread"
                ? "Aucune notification non lue"
                : "Aucune notification"}
            </p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              {filter === "unread"
                ? "Vous avez lu toutes vos notifications"
                : "Les notifications apparaîtront ici"}
            </p>
          </div>
        ) : (
          <div
            key={filter}
            className="space-y-2"
          >
            {filteredNotifications.map((notification, index) => {
              const TypeIcon = getTypeIcon(notification.type);
              const typeColor = getTypeColor(notification.type);
              const isUnread = !notification.isRead;
              const hasFromUser = !!notification.fromUser;
              const isDeleting = deletingIds.includes(notification.id);
              const isClicking = clickingId === notification.id;

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    animationDelay: `${Math.min(index * 40, 300)}ms`,
                  }}
                  className={`relative cursor-pointer bg-card/60 border rounded-2xl p-4 transition-all duration-300 group hover:border-blue-500/40 animate-notif-in ${
                    isUnread
                      ? "border-blue-500/40 bg-blue-500/5"
                      : "border-border/60"
                  } ${isDeleting ? "animate-notif-out" : ""} ${
                    isClicking ? "scale-[0.98] opacity-90" : "scale-100 opacity-100"
                  }`}
                >
                  {isUnread && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}

                  <button
                    onClick={(e) => deleteNotification(e, notification.id)}
                    disabled={isDeleting}
                    className="absolute bottom-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all disabled:opacity-50"
                    aria-label="Supprimer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      {hasFromUser ? (
                        <>
                          {notification.fromUser?.avatarUrl ? (
                            <img
                              src={notification.fromUser.avatarUrl}
                              alt={notification.fromUser.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                              style={{
                                backgroundColor:
                                  notification.fromUser?.avatarColor || "#8B5CF6",
                              }}
                            >
                              {notification.fromUser?.username
                                ?.charAt(0)
                                .toUpperCase() || "?"}
                            </div>
                          )}
                          <div
                            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center ${typeColor}`}
                          >
                            <TypeIcon className="w-2.5 h-2.5" />
                          </div>
                        </>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center ${typeColor}`}
                        >
                          <TypeIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <h3
                            className={`text-sm font-semibold ${
                              isUnread ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {notification.fromUser?.isCertified && (
                            <BadgeCheck
                              className="w-3.5 h-3.5 shrink-0"
                              fill={
                                notification.fromUser.badgeColor ||
                                notification.fromUser.avatarColor ||
                                "#3B82F6"
                              }
                              color="black"
                              strokeWidth={1.5}
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      {notification.body && (
                        <p
                          className={`text-sm mt-0.5 ${
                            isUnread
                              ? "text-foreground/90"
                              : "text-muted-foreground"
                          }`}
                        >
                          {notification.body}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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

        @keyframes notif-out {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
            max-height: 200px;
          }
          to {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            max-height: 0;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(6px);
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

        .animate-notif-out {
          animation: notif-out 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
          pointer-events: none;
          overflow: hidden;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out both;
        }

        .animate-slide-down {
          animation: slide-down 0.25s ease-out both;
        }
      `}</style>
    </div>
  );
}
