import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useKanbanStore } from '../store/kanbanStore';
import type { Task as TaskType } from '../types';
import { formatDate, isOverdue, getPriorityColor, getPriorityLabel } from '../utils';

interface TaskProps {
  task: TaskType;
  columnId: string;
}

export const Task: React.FC<TaskProps> = ({ task, columnId }) => {
  const { updateTask, deleteTask } = useKanbanStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editAssignedTo, setEditAssignedTo] = useState(task.assignedTo || '');
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ? (task.dueDate instanceof Date ? task.dueDate.toISOString().split('T')[0] : String(task.dueDate).split('T')[0]) : ''
  );
  const [editPriority, setEditPriority] = useState(task.priority);

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
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      assignedTo: editAssignedTo.trim() || undefined,
      dueDate: editDueDate ? new Date(editDueDate) : undefined,
      priority: editPriority,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditAssignedTo(task.assignedTo || '');
    setEditDueDate(
      task.dueDate ? (task.dueDate instanceof Date ? task.dueDate.toISOString().split('T')[0] : String(task.dueDate).split('T')[0]) : ''
    );
    setEditPriority(task.priority);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id, columnId);
    }
  };

  const dueDate = task.dueDate ? (task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate)) : null;
  const isOverdueTask = dueDate ? isOverdue(dueDate) : false;

  if (isEditing) {
    return (
      <div className="task task-editing">
        <div className="task-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="form-input"
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="form-textarea"
            placeholder="Task description (optional)"
            rows={3}
          />
          <input
            type="text"
            value={editAssignedTo}
            onChange={(e) => setEditAssignedTo(e.target.value)}
            className="form-input"
            placeholder="Assigned to (optional)"
          />
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="form-input"
          />
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="form-select"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <div className="task-actions">
            <button onClick={handleSave} className="btn-primary">
              Save
            </button>
            <button onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
          </div>
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
        <div className="task-priority">
          <span className={`priority-badge priority-${task.priority}`}>
            {getPriorityLabel(task.priority)}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      
      {task.assignedTo && (
        <div className="task-assigned">
          <span className="assigned-label">Assigned to:</span>
          <span className="assigned-value">{task.assignedTo}</span>
        </div>
      )}
      
      {dueDate && (
        <div className={`task-due-date ${isOverdueTask ? 'overdue' : ''}`}>
          <span className="due-label">Due:</span>
          <span className="due-value">{formatDate(dueDate)}</span>
          {isOverdueTask && <span className="overdue-badge">Overdue</span>}
        </div>
      )}
      
      <div className="task-footer">
        <div className="task-actions">
          <button onClick={() => setIsEditing(true)} className="btn-secondary">
            Edit
          </button>
          <button onClick={handleDelete} className="btn-danger">
            Delete
          </button>
        </div>
        <div className="task-meta">
          <span className="task-created">
            Created: {formatDate(task.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
