import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from './Task';
import { useKanbanStore } from '../store/kanbanStore';
import type { Column as ColumnType } from '../types';

interface ColumnProps {
  column: ColumnType;
  index: number;
}

export const Column: React.FC<ColumnProps> = ({ column, index }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  
  const { addTask, updateColumn, deleteColumn, moveColumn, tasks } = useKanbanStore();
  
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const columnTasks = column.taskIds.map((taskId) => tasks[taskId]).filter(Boolean);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        columnId: column.id,
        assignedTo: newTaskAssignedTo.trim() || undefined,
        dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined,
        priority: newTaskPriority,
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskAssignedTo('');
      setNewTaskDueDate('');
      setNewTaskPriority('medium');
      setIsAddingTask(false);
    }
  };

  const handleUpdateTitle = () => {
    if (editTitle.trim()) {
      updateColumn(column.id, editTitle.trim());
      setIsEditingTitle(false);
    }
  };

  const handleDeleteColumn = () => {
    if (window.confirm('Are you sure you want to delete this column? All tasks will be lost.')) {
      deleteColumn(column.id);
    }
  };

  const handleMoveColumn = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex >= 0) {
      moveColumn(column.id, newIndex);
    }
  };

  return (
    <div className="column">
      <div className="column-header">
        {isEditingTitle ? (
          <div className="form-row">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="form-input"
              placeholder="Column title"
            />
            <button
              onClick={handleUpdateTitle}
              className="btn-small btn-primary"
            >
              ✓
            </button>
            <button
              onClick={() => {
                setIsEditingTitle(false);
                setEditTitle(column.title);
              }}
              className="btn-small btn-secondary"
            >
              ✗
            </button>
          </div>
        ) : (
          <h2 className="column-title">{column.title}</h2>
        )}
        <div className="column-actions">
          <button
            onClick={() => setIsEditingTitle(true)}
            className="action-btn"
            title="Edit column title"
          >
            ✏️
          </button>
          <button
            onClick={() => handleMoveColumn('left')}
            className="action-btn"
            disabled={index === 0}
            title="Move column left"
          >
            ⬅️
          </button>
          <button
            onClick={() => handleMoveColumn('right')}
            className="action-btn"
            disabled={index === 2}
            title="Move column right"
          >
            ➡️
          </button>
          <button
            onClick={handleDeleteColumn}
            className="action-btn"
            title="Delete column"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="add-task-section">
        <button
          onClick={() => setIsAddingTask(true)}
          className="add-task-btn"
        >
          + Add Task
        </button>
      </div>

      {isAddingTask && (
        <div className="add-task-form">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="task-input"
            placeholder="Task title"
          />
          <textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="task-textarea"
            placeholder="Task description"
            rows={2}
          />
          <input
            type="text"
            value={newTaskAssignedTo}
            onChange={(e) => setNewTaskAssignedTo(e.target.value)}
            className="task-input"
            placeholder="Assigned to (optional)"
          />
          <input
            type="date"
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.target.value)}
            className="task-input"
            placeholder="Due date (optional)"
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="task-input"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <div className="form-buttons">
            <button
              onClick={handleAddTask}
              className="btn-small btn-primary"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
                setNewTaskAssignedTo('');
                setNewTaskDueDate('');
                setNewTaskPriority('medium');
              }}
              className="btn-small btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div ref={setNodeRef} className="task-list">
        <SortableContext items={column.taskIds} strategy={verticalListSortingStrategy}>
          {columnTasks.map((task) => (
            <Task key={task.id} task={task} columnId={column.id} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
