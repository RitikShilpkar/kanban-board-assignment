import { create } from 'zustand';
import type { KanbanState, CreateColumnData, CreateTaskData, UpdateTaskData, MoveTaskData, TaskAction } from '../types';
import { createTask, createColumn, reorderArray, generateId } from '../utils';
import { socketService } from '../services/socketService';

interface KanbanActions {
  addColumn: (data: CreateColumnData) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  moveColumn: (columnId: string, newIndex: number) => void;
  addTask: (data: CreateTaskData) => void;
  updateTask: (data: UpdateTaskData) => void;
  deleteTask: (id: string, columnId: string) => void;
  moveTask: (data: MoveTaskData) => void;
  setUsersOnline: (count: number) => void;
  setCurrentUser: (userId: string) => void;
  initializeSocketListeners: () => void;
  undo: () => void;
  redo: () => void;
  addToUndoStack: (action: TaskAction) => void;
}

const initialState: KanbanState = {
  columns: [
    {
      id: '1',
      title: 'To Do',
      taskIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'In Progress',
      taskIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: 'Done',
      taskIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  tasks: {},
  usersOnline: 0,
  currentUser: generateId(),
  undoStack: [],
  redoStack: [],
};

export const useKanbanStore = create<KanbanState & KanbanActions>((set, get) => ({
  ...initialState,

  addColumn: (data) => {
    const state = get();
    const newColumn = createColumn(data.title);
    
    const action: TaskAction = {
      type: 'create',
      columnId: newColumn.id,
      oldData: { columns: state.columns, tasks: state.tasks },
      newData: { columns: [...state.columns, newColumn], tasks: state.tasks },
      timestamp: new Date(),
    };

    set((state) => ({
      columns: [...state.columns, newColumn],
      undoStack: [...state.undoStack, action],
      redoStack: [],
    }));
    
    socketService.emit('createColumn', data);
  },

  updateColumn: (id, title) => {
    const state = get();
    const oldColumn = state.columns.find(col => col.id === id);
    if (!oldColumn) return;

    const action: TaskAction = {
      type: 'update',
      columnId: id,
      oldData: { columns: state.columns, tasks: state.tasks },
      newData: { 
        columns: state.columns.map(col => col.id === id ? { ...col, title, updatedAt: new Date() } : col),
        tasks: state.tasks
      },
      timestamp: new Date(),
    };

    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === id ? { ...col, title, updatedAt: new Date() } : col
      ),
      undoStack: [...state.undoStack, action],
      redoStack: [],
    }));
    
    socketService.emit('updateColumn', { id, title });
  },

  deleteColumn: (id) => {
    const state = get();
    const column = state.columns.find((col) => col.id === id);
    if (!column) return;

    const newTasks = { ...state.tasks };
    column.taskIds.forEach((taskId) => {
      delete newTasks[taskId];
    });

    const action: TaskAction = {
      type: 'delete',
      columnId: id,
      oldData: { columns: state.columns, tasks: state.tasks },
      newData: { 
        columns: state.columns.filter((col) => col.id !== id),
        tasks: newTasks
      },
      timestamp: new Date(),
    };

    set((state) => ({
      columns: state.columns.filter((col) => col.id !== id),
      tasks: newTasks,
      undoStack: [...state.undoStack, action],
      redoStack: [],
    }));
    
    socketService.emit('deleteColumn', { id });
  },

  moveColumn: (columnId, newIndex) => {
    const state = get();
    const currentIndex = state.columns.findIndex((col) => col.id === columnId);
    if (currentIndex === -1 || currentIndex === newIndex) return;

    const newColumns = reorderArray(state.columns, currentIndex, newIndex);
    
    const action: TaskAction = {
      type: 'move',
      columnId: columnId,
      oldData: { columns: state.columns, tasks: state.tasks },
      newData: { columns: newColumns, tasks: state.tasks },
      timestamp: new Date(),
    };

    set({ 
      columns: newColumns,
      undoStack: [...state.undoStack, action],
      redoStack: [],
    });
    
    socketService.emit('moveColumn', { columnId, newIndex });
  },

  addTask: (data) => {
    const state = get();
    const newTask = createTask(data.title, data.description, data.assignedTo, data.dueDate, data.priority);
    
    const action: TaskAction = {
      type: 'create',
      taskId: newTask.id,
      columnId: data.columnId,
      oldData: { columns: state.columns, tasks: state.tasks },
      newData: { 
        columns: state.columns.map((col) =>
          col.id === data.columnId
            ? { ...col, taskIds: [...col.taskIds, newTask.id], updatedAt: new Date() }
            : col
        ),
        tasks: { ...state.tasks, [newTask.id]: newTask }
      },
      timestamp: new Date(),
    };

    set((state) => ({
      tasks: { ...state.tasks, [newTask.id]: newTask },
      columns: state.columns.map((col) =>
        col.id === data.columnId
          ? { ...col, taskIds: [...col.taskIds, newTask.id], updatedAt: new Date() }
          : col
      ),
      undoStack: [...state.undoStack, action],
      redoStack: [],
    }));
    
    socketService.emit('createTask', data);
  },

  updateTask: (data) => {
    const state = get();
    const oldTask = state.tasks[data.id];
    if (!oldTask) return;

    const updatedTask = {
      ...oldTask,
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
      ...(data.priority && { priority: data.priority }),
      updatedAt: new Date(),
    };

    const action: TaskAction = {
      type: 'update',
      taskId: data.id,
      oldData: { columns: state.columns, tasks: state.tasks },
      newData: { 
        columns: state.columns,
        tasks: { ...state.tasks, [data.id]: updatedTask }
      },
      timestamp: new Date(),
    };

    set((state) => ({
      tasks: {
        ...state.tasks,
        [data.id]: updatedTask,
      },
      undoStack: [...state.undoStack, action],
      redoStack: [],
    }));
    
    socketService.emit('updateTask', data);
  },

  deleteTask: (id, columnId) => {
    const state = get();
    const task = state.tasks[id];
    if (!task) return;

    const newTasks = { ...state.tasks };
    delete newTasks[id];

    const action: TaskAction = {
      type: 'delete',
      taskId: id,
      columnId: columnId,
      oldData: { columns: state.columns, tasks: state.tasks },
      newData: { 
        columns: state.columns.map((col) =>
          col.id === columnId
            ? { ...col, taskIds: col.taskIds.filter((taskId) => taskId !== id), updatedAt: new Date() }
            : col
        ),
        tasks: newTasks
      },
      timestamp: new Date(),
    };

    set((state) => ({
      tasks: newTasks,
      columns: state.columns.map((col) =>
        col.id === columnId
          ? { ...col, taskIds: col.taskIds.filter((taskId) => taskId !== id), updatedAt: new Date() }
          : col
      ),
      undoStack: [...state.undoStack, action],
      redoStack: [],
    }));
    
    socketService.emit('deleteTask', { id, columnId });
  },

  moveTask: (data) => {
    console.log('🔄 moveTask called with data:', data);
    const state = get();
    const sourceColumn = state.columns.find((col) => col.id === data.sourceColumnId);
    const destColumn = state.columns.find((col) => col.id === data.destinationColumnId);

    if (!sourceColumn || !destColumn) {
      console.warn('⚠️ Source or destination column not found:', { sourceColumn, destColumn });
      return;
    }

    let newSourceTaskIds = [...sourceColumn.taskIds];
    let newDestTaskIds = [...destColumn.taskIds];

          if (data.sourceColumnId === data.destinationColumnId) {
        newSourceTaskIds = reorderArray(newSourceTaskIds, data.sourceIndex, data.destinationIndex);
        console.log('🔄 Reordering within same column:', { newSourceTaskIds });
      } else {
        newSourceTaskIds.splice(data.sourceIndex, 1);
        newDestTaskIds.splice(data.destinationIndex, 0, data.taskId);
        console.log('🔄 Moving between columns:', { newSourceTaskIds, newDestTaskIds });
      }

    const newColumns = state.columns.map((col) => {
      if (col.id === data.sourceColumnId) {
        return { ...col, taskIds: newSourceTaskIds, updatedAt: new Date() };
      }
      if (col.id === data.destinationColumnId) {
        return { ...col, taskIds: newDestTaskIds, updatedAt: new Date() };
      }
      return col;
    });

    const action: TaskAction = {
      type: 'move',
      taskId: data.taskId,
      columnId: data.destinationColumnId,
      oldData: { columns: state.columns, tasks: state.tasks },
      newData: { columns: newColumns, tasks: state.tasks },
      timestamp: new Date(),
    };

    console.log('🔄 Setting new state with columns:', newColumns);
    
    set((state) => ({
      columns: newColumns,
      undoStack: [...state.undoStack, action],
      redoStack: [],
    }));
    
    console.log('📤 Emitting moveTask event:', data);
    socketService.emit('moveTask', data);
  },

  setUsersOnline: (count) => {
    set({ usersOnline: count });
  },

  setCurrentUser: (userId) => {
    set({ currentUser: userId });
  },

  addToUndoStack: (action) => {
    set((state) => ({
      undoStack: [...state.undoStack, action],
      redoStack: [],
    }));
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;

    const lastAction = state.undoStack[state.undoStack.length - 1];
    const newUndoStack = state.undoStack.slice(0, -1);

    if (lastAction.oldData) {
      set({
        columns: lastAction.oldData.columns,
        tasks: lastAction.oldData.tasks,
        undoStack: newUndoStack,
        redoStack: [...state.redoStack, lastAction],
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;

    const lastRedoAction = state.redoStack[state.redoStack.length - 1];
    const newRedoStack = state.redoStack.slice(0, -1);

    if (lastRedoAction.newData) {
      set({
        columns: lastRedoAction.newData.columns,
        tasks: lastRedoAction.newData.tasks,
        redoStack: newRedoStack,
        undoStack: [...state.undoStack, lastRedoAction],
      });
    }
  },

  initializeSocketListeners: () => {
    console.log('🔧 Setting up socket listeners in store...');
    
    socketService.on('createColumn', (data) => {
      console.log('📥 Received createColumn event:', data);
      const newColumn = createColumn(data.title);
      set((state) => ({
        columns: [...state.columns, newColumn],
      }));
    });

    socketService.on('updateColumn', (data) => {
      console.log('📥 Received updateColumn event:', data);
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === data.id ? { ...col, title: data.title, updatedAt: new Date() } : col
        ),
      }));
    });

    socketService.on('deleteColumn', (data) => {
      console.log('📥 Received deleteColumn event:', data);
      const state = get();
      const column = state.columns.find((col) => col.id === data.id);
      if (!column) return;

      const newTasks = { ...state.tasks };
      column.taskIds.forEach((taskId) => {
        delete newTasks[taskId];
      });

      set((state) => ({
        columns: state.columns.filter((col) => col.id !== data.id),
        tasks: newTasks,
      }));
    });

    socketService.on('moveColumn', (data) => {
      console.log('📥 Received moveColumn event:', data);
      const state = get();
      const currentIndex = state.columns.findIndex((col) => col.id === data.columnId);
      if (currentIndex === -1 || currentIndex === data.newIndex) return;

      const newColumns = reorderArray(state.columns, currentIndex, data.newIndex);
      set({ columns: newColumns });
    });

    socketService.on('createTask', (data) => {
      console.log('📥 Received createTask event:', data);
      const newTask = createTask(
        data.title, 
        data.description, 
        data.assignedTo, 
        data.dueDate ? new Date(data.dueDate) : undefined, 
        data.priority
      );
      set((state) => ({
        tasks: { ...state.tasks, [newTask.id]: newTask },
        columns: state.columns.map((col) =>
          col.id === data.columnId
            ? { ...col, taskIds: [...col.taskIds, newTask.id], updatedAt: new Date() }
            : col
        ),
      }));
    });

    socketService.on('updateTask', (data) => {
      console.log('📥 Received updateTask event:', data);
      set((state) => ({
        tasks: {
          ...state.tasks,
          [data.id]: {
            ...state.tasks[data.id],
            ...(data.title && { title: data.title }),
            ...(data.description && { description: data.description }),
            ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
            ...(data.dueDate !== undefined && { dueDate: new Date(data.dueDate) }),
            ...(data.priority && { priority: data.priority }),
            updatedAt: new Date(),
          },
        },
      }));
    });

    socketService.on('deleteTask', (data) => {
      console.log('📥 Received deleteTask event:', data);
      const state = get();
      const newTasks = { ...state.tasks };
      delete newTasks[data.id];

      set((state) => ({
        tasks: newTasks,
        columns: state.columns.map((col) =>
          col.id === data.columnId
            ? { ...col, taskIds: col.taskIds.filter((taskId) => taskId !== data.id), updatedAt: new Date() }
            : col
        ),
      }));
    });

    socketService.on('moveTask', (data) => {
      console.log('📥 Received moveTask event:', data);
      const state = get();
      const sourceColumn = state.columns.find((col) => col.id === data.sourceColumnId);
      const destColumn = state.columns.find((col) => col.id === data.destinationColumnId);

      if (!sourceColumn || !destColumn) {
        console.warn('⚠️ Socket listener: Source or destination column not found:', { sourceColumn, destColumn });
        return;
      }

      let newSourceTaskIds = [...sourceColumn.taskIds];
      let newDestTaskIds = [...destColumn.taskIds];

      if (data.sourceColumnId === data.destinationColumnId) {
        newSourceTaskIds = reorderArray(newSourceTaskIds, data.sourceIndex, data.destinationIndex);
        console.log('📥 Reordering within same column:', { newSourceTaskIds });
      } else {
        newSourceTaskIds.splice(data.sourceIndex, 1);
        newDestTaskIds.splice(data.destinationIndex, 0, data.taskId);
        console.log('📥 Moving between columns:', { newSourceTaskIds, newDestTaskIds });
      }

      const newColumns = state.columns.map((col) => {
        if (col.id === data.sourceColumnId) {
          return { ...col, taskIds: newSourceTaskIds, updatedAt: new Date() };
        }
        if (col.id === data.destinationColumnId) {
          return { ...col, taskIds: newDestTaskIds, updatedAt: new Date() };
        }
        return col;
      });

      console.log('📥 Setting new columns state:', newColumns);
      
      set((state) => ({
        columns: newColumns,
      }));
    });
    
    console.log('✅ All socket listeners set up successfully');
  },
}));
