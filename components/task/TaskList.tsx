'use client';

import type { Task, Tag, TaskStatus } from '@/lib/types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  tags: Tag[];
  isLoading?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

function TaskSkeleton() {
  return (
    <div className="card border-l-4 border-l-gray-200 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>

      {/* Description skeleton */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex gap-1">
          <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="text-center py-12 px-4"
      role="status"
      aria-label="No hay tareas"
    >
      <svg
        className="w-16 h-16 mx-auto text-muted-foreground mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
      <h3 className="text-lg font-medium text-foreground mb-2">No hay tareas</h3>
      <p className="text-muted-foreground">
        Crea tu primera tarea para comenzar a organizar tu trabajo.
      </p>
    </div>
  );
}

export function TaskList({
  tasks,
  tags,
  isLoading = false,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="task-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <TaskSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          tags={tags}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
