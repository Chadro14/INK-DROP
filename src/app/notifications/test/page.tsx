"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Check, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Loader } from "@/components/ui/loader";

const API_URL = "https://ink-backend.vercel.app";

type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
};

export default function NotificationsTestPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.data || []);
        }
      } catch (error) {
        console.error("Erreur chargement notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Erreur marquage lu:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  if (loading) {
    return <Loader message="Chargement des notifications" />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-zinc-950 text-white">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <span className="text-base font-bold tracking-tight text-white/90 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Notifications
          </span>
          <span className="text-sm text-zinc-500">{notifications.length}</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="w-12 h-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-white">Aucune notification</h3>
            <p className="text-zinc-400 text-sm">Vous serez informé des nouveautés ici</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all ${
                  notif.isRead
                    ? "bg-zinc-900/30 border-zinc-800/40"
                    : "bg-zinc-900/60 border-blue-500/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className={`text-sm font-semibold ${notif.isRead ? "text-zinc-400" : "text-white"}`}>
                      {notif.title}
                    </h4>
                    <p className="text-sm text-zinc-400">{notif.body}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="p-1.5 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1.5 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
