import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { Column } from './Column';
import { Task } from './Task';
import { useKanbanStore } from '../store/kanbanStore';
import { socketService } from '../services/socketService';
import type { Task as TaskType } from '../types';

export const KanbanBoard: React.FC = () => {
  const { columns, tasks, addColumn, moveTask, usersOnline, undo, redo, undoStack, redoStack } = useKanbanStore();
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const checkConnection = () => {
      const status = socketService.getConnectionStatus();
      setConnectionStatus(status);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks[active.id as string];
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    if (taskId === overId) return;

    const sourceColumn = columns.find((col) => col.taskIds.includes(taskId));
    const destColumn = columns.find((col) => col.id === overId);

    if (!sourceColumn) return;

    if (destColumn) {
      const sourceIndex = sourceColumn.taskIds.indexOf(taskId);
      const destIndex = destColumn.taskIds.length;

      console.log('🔄 Moving task to column:', { taskId, sourceColumnId: sourceColumn.id, destinationColumnId: destColumn.id, sourceIndex, destinationIndex: destIndex });
      
      moveTask({
        taskId,
        sourceColumnId: sourceColumn.id,
        destinationColumnId: destColumn.id,
        sourceIndex,
        destinationIndex: destIndex,
      });
    } else {
      const overTask = tasks[overId];
      if (overTask) {
        const sourceColumn = columns.find((col) => col.taskIds.includes(taskId));
        const destColumn = columns.find((col) => col.taskIds.includes(overId));

        if (sourceColumn && destColumn) {
          const sourceIndex = sourceColumn.taskIds.indexOf(taskId);
          const destIndex = destColumn.taskIds.indexOf(overId);

          console.log('🔄 Reordering task:', { taskId, sourceColumnId: sourceColumn.id, destinationColumnId: destColumn.id, sourceIndex, destinationIndex: destIndex });
          
          moveTask({
            taskId,
            sourceColumnId: sourceColumn.id,
            destinationColumnId: destColumn.id,
            sourceIndex,
            destinationIndex: destIndex,
          });
        }
      }
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn({ title: newColumnTitle.trim() });
      setNewColumnTitle('');
      setShowAddColumn(false);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <div>
          <h1 className="kanban-title">Kanban Board</h1>
          <p className="kanban-subtitle">Organize your tasks</p>
        </div>
        <div className="kanban-controls">
          <div className="connection-status">
            <div className={`status-indicator ${getConnectionStatusColor()}`}></div>
            <span className="status-text">{getConnectionStatusText()}</span>
          </div>
          <div className="users-online">
            <div className="online-indicator"></div>
            <span>
              {usersOnline} user{usersOnline !== 1 ? 's' : ''} online
            </span>
          </div>
          <div className="undo-redo-controls">
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className="btn-secondary"
              title={`Undo (${undoStack.length} actions available)`}
            >
              ↩️ Undo {undoStack.length > 0 && `(${undoStack.length})`}
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="btn-secondary"
              title={`Redo (${redoStack.length} actions available)`}
            >
              ↪️ Redo {redoStack.length > 0 && `(${redoStack.length})`}
            </button>
          </div>
          <button
            onClick={() => setShowAddColumn(true)}
            className="add-column-btn"
          >
            + Add Column
          </button>
        </div>
      </div>

      {showAddColumn && (
        <div className="add-column-form">
          <h3 className="form-title">Create New Column</h3>
          <div className="form-row">
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              className="form-input"
              placeholder="Enter column title..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
              autoFocus
            />
            <button
              onClick={handleAddColumn}
              className="btn-primary"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowAddColumn(false);
                setNewColumnTitle('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="kanban-board">
          {columns.map((column, index) => (
            <Column key={column.id} column={column} index={index} />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <Task task={activeTask} columnId="" /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
