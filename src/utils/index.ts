import type { Task, Column } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const createTask = (title: string, description: string, assignedTo?: string, dueDate?: Date, priority: 'low' | 'medium' | 'high' = 'medium'): Task => {
  const now = new Date();
  return {
    id: generateId(),
    title,
    description,
    assignedTo,
    dueDate,
    priority,
    createdAt: now,
    updatedAt: now,
  };
};

export const createColumn = (title: string): Column => {
  const now = new Date();
  return {
    id: generateId(),
    title,
    taskIds: [],
    createdAt: now,
    updatedAt: now,
  };
};

export const reorderArray = <T>(array: T[], startIndex: number, endIndex: number): T[] => {
  const result = Array.from(array);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const isOverdue = (dueDate: Date): boolean => {
  return new Date() > dueDate;
};

export const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'low': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'high': return '#ef4444';
    default: return '#6b7280';
  }
};

export const getPriorityLabel = (priority: 'low' | 'medium' | 'high'): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};
