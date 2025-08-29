import React, { useEffect } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { socketService } from './services/socketService';
import { useKanbanStore } from './store/kanbanStore';

function App() {
  const { setUsersOnline, initializeSocketListeners } = useKanbanStore();

  useEffect(() => {
    const socket = socketService.connect();
    initializeSocketListeners();

    socket.on('userConnected', () => {
      setUsersOnline(1);
    });

    socket.on('userDisconnected', () => {
      setUsersOnline(0);
    });

    return () => {
      socketService.disconnect();
    };
  }, [setUsersOnline, initializeSocketListeners]);

  return <KanbanBoard />;
}

export default App;
