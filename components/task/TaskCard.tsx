'use client';

import { useState } from 'react';
import type { Task, Tag, TaskStatus } from '@/lib/types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskDueDateIndicator } from './TaskDueDateIndicator';
import { TAG_COLOR_STYLES } from './TaskTagsInput';

interface TaskCardProps {
  task: Task;
  tags: Tag[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const STATUS_BORDER_STYLES: Record<TaskStatus, string> = {
  pending: 'border-l-amber-500',
  in_progress: 'border-l-blue-500',
  completed: 'border-l-green-500',
};

const STATUS_ORDER: TaskStatus[] = ['pending', 'in_progress', 'completed'];

function getNextStatus(currentStatus: TaskStatus): TaskStatus {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
  return STATUS_ORDER[nextIndex];
}

export function TaskCard({ task, tags, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const taskTags = tags.filter((tag) => task.tags.includes(tag.id));
  const borderStyle = STATUS_BORDER_STYLES[task.status];
  const isCompleted = task.status === 'completed';

  const handleStatusClick = () => {
    const nextStatus = getNextStatus(task.status);
    onStatusChange(task.id, nextStatus);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(task.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <article
      className={`card border-l-4 ${borderStyle} transition-shadow hover:shadow-md ${
        isCompleted ? 'opacity-70' : ''
      }`}
      role="article"
      aria-label={`Tarea: ${task.title}`}
    >
      {/* Header: Priority, Title, Status */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TaskPriorityBadge priority={task.priority} />
          <h3
            className={`text-lg font-medium truncate ${
              isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
          >
            {task.title}
          </h3>
        </div>
        <TaskStatusBadge
          status={task.status}
          onClick={handleStatusClick}
          interactive
        />
      </div>

      {/* Description */}
      {task.description && (
        <p
          className={`text-sm mb-3 line-clamp-2 ${
            isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'
          }`}
        >
          {task.description}
        </p>
      )}

      {/* Footer: Due date and Tags */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {task.dueDate ? (
          <TaskDueDateIndicator dueDate={task.dueDate} compact />
        ) : (
          <span />
        )}
        {taskTags.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end">
            {taskTags.map((tag) => (
              <span
                key={tag.id}
                className={`px-2 py-0.5 rounded-full text-xs ${TAG_COLOR_STYLES[tag.color]}`}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {showDeleteConfirm ? (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground mr-auto">Eliminar tarea?</span>
          <button
            type="button"
            onClick={handleCancelDelete}
            className="btn btn-ghost px-3 py-1.5 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="btn btn-destructive px-3 py-1.5 text-sm"
            aria-label="Confirmar eliminar tarea"
          >
            Eliminar
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="btn btn-ghost px-3 py-1.5 text-sm"
            aria-label={`Editar tarea ${task.title}`}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Editar
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="btn btn-ghost px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            aria-label={`Eliminar tarea ${task.title}`}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Eliminar
          </button>
        </div>
      )}
    </article>
  );
}
