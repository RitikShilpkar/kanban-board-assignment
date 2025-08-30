export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanState {
  columns: Column[];
  tasks: Record<string, Task>;
  usersOnline: number;
  currentUser: string;
  undoStack: TaskAction[];
  redoStack: TaskAction[];
}

export interface TaskAction {
  type: 'create' | 'update' | 'delete' | 'move';
  taskId?: string;
  columnId?: string;
  oldData?: any;
  newData?: any;
  timestamp: Date;
}

export interface CreateColumnData {
  title: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  columnId: string;
  assignedTo?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface UpdateTaskData {
  id: string;
  title?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
}

export interface MoveTaskData {
  taskId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  sourceIndex: number;
  destinationIndex: number;
}

export interface SocketEvents {
  createColumn: (data: CreateColumnData) => void;
  updateColumn: (data: { id: string; title: string }) => void;
  deleteColumn: (data: { id: string }) => void;
  createTask: (data: CreateTaskData) => void;
  updateTask: (data: UpdateTaskData) => void;
  deleteTask: (data: { id: string; columnId: string }) => void;
  moveTask: (data: MoveTaskData) => void;
  moveColumn: (data: { columnId: string; newIndex: number }) => void;
  userConnected: () => void;
  userDisconnected: () => void;
}
