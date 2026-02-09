'use client';

import type { Task, Tag, TaskStatus } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TaskListProps {
  tasks: Task[];
  tags: Tag[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

function TaskSkeleton() {
  return (
    <div className="bg-card rounded-[24px] p-5 animate-pulse">
      {/* Horizontal layout: checkbox + content left, tag + date right */}
      <div className="flex items-center justify-between gap-4">
        {/* Left side: checkbox + title + meta */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-7 h-7 bg-muted rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded-lg w-2/3" />
            <div className="h-4 bg-muted rounded-lg w-1/2" />
          </div>
        </div>

        {/* Right side: tag + date */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-6 w-20 bg-muted rounded-xl" />
          <div className="h-5 w-14 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="text-center py-16 px-6 bg-card rounded-[24px]"
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
      <h3 className="text-lg font-semibold text-foreground mb-2">No hay tareas</h3>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
        Crea tu primera tarea para comenzar a organizar tu trabajo.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      className="text-center py-16 px-6 bg-card rounded-[24px]"
      role="alert"
      aria-label="Error al cargar tareas"
    >
      <AlertTriangle className="w-16 h-16 mx-auto text-destructive mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Error al cargar tareas
      </h3>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      )}
    </div>
  );
}

export function TaskList({
  tasks,
  tags,
  isLoading = false,
  error,
  onRetry,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <TaskSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-3">
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
