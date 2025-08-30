import { useEffect } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { socketService } from './services/socketService';
import { useKanbanStore } from './store/kanbanStore';
import './index.css';

function App() {
  const { setUsersOnline, initializeSocketListeners } = useKanbanStore();

  useEffect(() => {
    const socket = socketService.connect();
    
    const setupListeners = () => {
      console.log('🔧 Setting up socket listeners...');
      initializeSocketListeners();
    };

    if (socket) {
      if (socket.connected) {
        setupListeners();
      } else {
        socket.on('connect', setupListeners);
      }
    }

    socket?.on('userConnected', (data: { userId: string; totalUsers: number }) => {
      console.log('👤 User connected:', data);
      setUsersOnline(data.totalUsers);
    });

    socket?.on('userDisconnected', (data: { totalUsers: number }) => {
      console.log('👤 User disconnected:', data);
      setUsersOnline(data.totalUsers);
    });

    return () => {
      socketService.disconnect();
    };
  }, [setUsersOnline, initializeSocketListeners]);

  return <KanbanBoard />;
}

export default App;
