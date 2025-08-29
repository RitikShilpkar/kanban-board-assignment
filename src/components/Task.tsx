import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task as TaskType } from '../types';
import { useKanbanStore } from '../store/kanbanStore';

interface TaskProps {
  task: TaskType;
  columnId: string;
}

export const Task: React.FC<TaskProps> = ({ task, columnId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  
  const { updateTask, deleteTask } = useKanbanStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    updateTask({
      id: task.id,
      title: editTitle,
      description: editDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteTask(task.id, columnId);
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="task">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="task-input"
          placeholder="Task title"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="task-textarea"
          placeholder="Task description"
          rows={2}
        />
        <div className="form-buttons">
          <button
            onClick={handleSave}
            className="btn-small btn-primary"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="btn-small btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task ${isDragging ? 'dragging' : ''}`}
    >
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <button
            onClick={() => setIsEditing(true)}
            className="action-btn"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="action-btn"
          >
            🗑️
          </button>
        </div>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-date">
        {new Date(task.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
};
