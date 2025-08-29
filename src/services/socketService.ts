import { io, Socket } from 'socket.io-client';
import type { SocketEvents } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private url = 'http://localhost:3001';

  connect() {
    this.socket = io(this.url);
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit<T extends keyof SocketEvents>(event: T, data: Parameters<SocketEvents[T]>[0]) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on<T extends keyof SocketEvents>(event: T, callback: SocketEvents[T]) {
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off<T extends keyof SocketEvents>(event: T) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
