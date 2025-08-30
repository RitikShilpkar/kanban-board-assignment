import { io, Socket } from 'socket.io-client';
import type { SocketEvents } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private url = 'http://localhost:3001';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    try {
      console.log('🔄 Connecting to Socket.IO server...');
      
      this.socket = io(this.url, {
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });
      
      this.socket.on('connect', () => {
        console.log('✅ Connected to Socket.IO server');
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from Socket.IO server:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Reconnection error:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed after all attempts');
      });

      return this.socket;
    } catch (error) {
      console.error('❌ Failed to create Socket.IO connection:', error);
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔄 Disconnecting from Socket.IO server...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit<T extends keyof SocketEvents>(event: T, data: Parameters<SocketEvents[T]>[0]) {
    if (this.socket && this.socket.connected) {
      console.log(`📤 Emitting ${event}:`, data);
      this.socket.emit(event, data);
    } else {
      console.warn(`⚠️ Cannot emit ${event}: Socket not connected`);
    }
  }

  on<T extends keyof SocketEvents>(event: T, callback: SocketEvents[T]) {
    if (this.socket) {
      console.log(`📡 Listening for ${event} events`);
      this.socket.on(event, callback as any);
    } else {
      console.warn(`⚠️ Cannot listen for ${event}: Socket not created`);
    }
  }

  off<T extends keyof SocketEvents>(event: T) {
    if (this.socket) {
      console.log(`🔇 Stopped listening for ${event} events`);
      this.socket.off(event);
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket ? this.socket.connected : false;
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' | 'error' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'connecting';
  }
}

export const socketService = new SocketService();
