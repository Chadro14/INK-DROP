// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

const API_URL = "https://ink-backend.vercel.app";

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket?.connected) return;

    this.socket = io(API_URL, {
      query: { userId },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connecté au serveur WebSocket');
    });

    this.socket.on('notification', (data) => {
      console.log('📩 Notification reçue:', data);
      // ✅ Afficher une notification
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Déconnecté du serveur WebSocket');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
