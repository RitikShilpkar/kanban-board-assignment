import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from './Task';
import { useKanbanStore } from '../store/kanbanStore';
import type { Column as ColumnType } from '../types';

interface ColumnProps {
  column: ColumnType;
}

export const Column: React.FC<ColumnProps> = ({ column }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  
  const { addTask, updateColumn, deleteColumn, tasks } = useKanbanStore();
  
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
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
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
          >
            ✏️
          </button>
          <button
            onClick={handleDeleteColumn}
            className="action-btn"
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
