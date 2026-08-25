"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = 'https://ink-backend.vercel.app';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  notifications: any[];
  latestNotification: any;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  latestNotification: null,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [latestNotification, setLatestNotification] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;

      if (!userId) return;

      const newSocket = io(API_URL, {
        query: { userId },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connecté');
        setIsConnected(true);
      });

      newSocket.on('notification', (data) => {
        console.log('📩 Notification reçue:', data);
        setLatestNotification(data);
        setNotifications((prev) => [data, ...prev]);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket déconnecté');
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } catch (error) {
      console.error('❌ Erreur connexion socket:', error);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, notifications, latestNotification }}>
      {children}
    </SocketContext.Provider>
  );
}
