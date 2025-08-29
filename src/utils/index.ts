import type { Task, Column } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const createTask = (title: string, description: string): Task => {
  const now = new Date();
  return {
    id: generateId(),
    title,
    description,
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
