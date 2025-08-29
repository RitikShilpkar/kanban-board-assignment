import { create } from 'zustand';
import type { KanbanState, Column, Task, CreateColumnData, CreateTaskData, UpdateTaskData, MoveTaskData } from '../types';
import { createTask, createColumn, reorderArray, generateId } from '../utils';
import { socketService } from '../services/socketService';

interface KanbanActions {
  addColumn: (data: CreateColumnData) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  addTask: (data: CreateTaskData) => void;
  updateTask: (data: UpdateTaskData) => void;
  deleteTask: (id: string, columnId: string) => void;
  moveTask: (data: MoveTaskData) => void;
  setUsersOnline: (count: number) => void;
  setCurrentUser: (userId: string) => void;
  initializeSocketListeners: () => void;
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
};

export const useKanbanStore = create<KanbanState & KanbanActions>((set, get) => ({
  ...initialState,

  addColumn: (data) => {
    const newColumn = createColumn(data.title);
    set((state) => ({
      columns: [...state.columns, newColumn],
    }));
    socketService.emit('createColumn', data);
  },

  updateColumn: (id, title) => {
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === id ? { ...col, title, updatedAt: new Date() } : col
      ),
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

    set((state) => ({
      columns: state.columns.filter((col) => col.id !== id),
      tasks: newTasks,
    }));
    socketService.emit('deleteColumn', { id });
  },

  addTask: (data) => {
    const newTask = createTask(data.title, data.description);
    set((state) => ({
      tasks: { ...state.tasks, [newTask.id]: newTask },
      columns: state.columns.map((col) =>
        col.id === data.columnId
          ? { ...col, taskIds: [...col.taskIds, newTask.id], updatedAt: new Date() }
          : col
      ),
    }));
    socketService.emit('createTask', data);
  },

  updateTask: (data) => {
    set((state) => ({
      tasks: {
        ...state.tasks,
        [data.id]: {
          ...state.tasks[data.id],
          ...(data.title && { title: data.title }),
          ...(data.description && { description: data.description }),
          updatedAt: new Date(),
        },
      },
    }));
    socketService.emit('updateTask', data);
  },

  deleteTask: (id, columnId) => {
    const state = get();
    const newTasks = { ...state.tasks };
    delete newTasks[id];

    set((state) => ({
      tasks: newTasks,
      columns: state.columns.map((col) =>
        col.id === columnId
          ? { ...col, taskIds: col.taskIds.filter((taskId) => taskId !== id), updatedAt: new Date() }
          : col
      ),
    }));
    socketService.emit('deleteTask', { id, columnId });
  },

  moveTask: (data) => {
    const state = get();
    const sourceColumn = state.columns.find((col) => col.id === data.sourceColumnId);
    const destColumn = state.columns.find((col) => col.id === data.destinationColumnId);

    if (!sourceColumn || !destColumn) return;

    let newSourceTaskIds = [...sourceColumn.taskIds];
    let newDestTaskIds = [...destColumn.taskIds];

    if (data.sourceColumnId === data.destinationColumnId) {
      newSourceTaskIds = reorderArray(newSourceTaskIds, data.sourceIndex, data.destinationIndex);
    } else {
      newSourceTaskIds.splice(data.sourceIndex, 1);
      newDestTaskIds.splice(data.destinationIndex, 0, data.taskId);
    }

    set((state) => ({
      columns: state.columns.map((col) => {
        if (col.id === data.sourceColumnId) {
          return { ...col, taskIds: newSourceTaskIds, updatedAt: new Date() };
        }
        if (col.id === data.destinationColumnId) {
          return { ...col, taskIds: newDestTaskIds, updatedAt: new Date() };
        }
        return col;
      }),
    }));
    socketService.emit('moveTask', data);
  },

  setUsersOnline: (count) => {
    set({ usersOnline: count });
  },

  setCurrentUser: (userId) => {
    set({ currentUser: userId });
  },

  initializeSocketListeners: () => {
    socketService.on('createColumn', (data) => {
      const newColumn = createColumn(data.title);
      set((state) => ({
        columns: [...state.columns, newColumn],
      }));
    });

    socketService.on('updateColumn', (data) => {
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === data.id ? { ...col, title: data.title, updatedAt: new Date() } : col
        ),
      }));
    });

    socketService.on('deleteColumn', (data) => {
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

    socketService.on('createTask', (data) => {
      const newTask = createTask(data.title, data.description);
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
      set((state) => ({
        tasks: {
          ...state.tasks,
          [data.id]: {
            ...state.tasks[data.id],
            ...(data.title && { title: data.title }),
            ...(data.description && { description: data.description }),
            updatedAt: new Date(),
          },
        },
      }));
    });

    socketService.on('deleteTask', (data) => {
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
      const state = get();
      const sourceColumn = state.columns.find((col) => col.id === data.sourceColumnId);
      const destColumn = state.columns.find((col) => col.id === data.destinationColumnId);

      if (!sourceColumn || !destColumn) return;

      let newSourceTaskIds = [...sourceColumn.taskIds];
      let newDestTaskIds = [...destColumn.taskIds];

      if (data.sourceColumnId === data.destinationColumnId) {
        newSourceTaskIds = reorderArray(newSourceTaskIds, data.sourceIndex, data.destinationIndex);
      } else {
        newSourceTaskIds.splice(data.sourceIndex, 1);
        newDestTaskIds.splice(data.destinationIndex, 0, data.taskId);
      }

      set((state) => ({
        columns: state.columns.map((col) => {
          if (col.id === data.sourceColumnId) {
            return { ...col, taskIds: newSourceTaskIds, updatedAt: new Date() };
          }
          if (col.id === data.destinationColumnId) {
            return { ...col, taskIds: newDestTaskIds, updatedAt: new Date() };
          }
          return col;
        }),
      }));
    });
  },
}));
