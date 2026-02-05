'use client';

import type { Task, Tag, TaskStatus } from '@/lib/types';
import { cn, formatShortDate, isSameDay, formatTime } from '@/lib/utils';
import { Check } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  tags: Tag[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const STATUS_ORDER: TaskStatus[] = ['pending', 'in_progress', 'completed'];

function getNextStatus(currentStatus: TaskStatus): TaskStatus {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
  return STATUS_ORDER[nextIndex];
}

/**
 * Format task meta information for display
 * Shows tag name and date/time information
 */
function formatTaskMeta(task: Task, mainTag?: Tag): string {
  const parts: string[] = [];

  if (mainTag) {
    parts.push(mainTag.name);
  }

  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const isToday = isSameDay(dueDate, new Date());

    if (isToday) {
      parts.push(`Hoy, ${formatTime(task.dueDate)}`);
    } else {
      parts.push(formatShortDate(task.dueDate));
    }
  } else {
    parts.push('Sin fecha');
  }

  return parts.join(' · ');
}

/**
 * Get tag badge styles based on color
 * Returns classes for colored background with 20% opacity
 * Supports dark mode with adjusted text colors
 */
function getTagBadgeStyles(color: string): string {
  const colorMap: Record<string, string> = {
    orange: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
    blue: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    red: 'bg-red-500/20 text-red-600 dark:text-red-400',
    violet: 'bg-primary/20 text-primary',
    purple: 'bg-primary/20 text-primary',
    green: 'bg-green-500/20 text-green-600 dark:text-green-400',
    amber: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    yellow: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    lime: 'bg-lime-500/20 text-lime-600 dark:text-lime-400',
    emerald: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    teal: 'bg-teal-500/20 text-teal-600 dark:text-teal-400',
    cyan: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
    sky: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
    indigo: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    fuchsia: 'bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400',
    pink: 'bg-pink-500/20 text-pink-600 dark:text-pink-400',
    rose: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
  };

  return colorMap[color] || 'bg-muted/50 text-muted-foreground';
}

export function TaskCard({ task, tags, onEdit, onStatusChange }: TaskCardProps) {
  const mainTag = tags.find((tag) => task.tags.includes(tag.id));
  const isCompleted = task.status === 'completed';

  const handleCardClick = () => {
    onEdit(task);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = getNextStatus(task.status);
    onStatusChange(task.id, nextStatus);
  };

  return (
    <article
      className={cn(
        'flex items-center justify-between p-5 bg-card rounded-[24px]',
        'transition-all duration-200 cursor-pointer',
        'hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-px',
        isCompleted && 'opacity-60'
      )}
      onClick={handleCardClick}
      role="article"
      aria-label={`Tarea: ${task.title}`}
    >
      {/* Left side: Checkbox + Content */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Status Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
            'transition-all duration-200',
            isCompleted
              ? 'bg-primary'
              : 'border-2 border-border hover:border-primary'
          )}
          aria-label={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
          type="button"
        >
          {isCompleted && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </button>

        {/* Task Content */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <h3
            className={cn(
              'text-base font-semibold',
              isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
            )}
          >
            {task.title}
          </h3>
          <p className="text-[13px] text-muted-foreground">
            {formatTaskMeta(task, mainTag)}
          </p>
        </div>
      </div>

      {/* Right side: Tag Badge + Date */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {mainTag && (
          <span
            className={cn(
              'px-2.5 py-1 rounded-xl text-[11px] font-semibold',
              getTagBadgeStyles(mainTag.color)
            )}
          >
            {mainTag.name}
          </span>
        )}
        {task.dueDate && (
          <span className="text-xs font-medium text-muted-foreground">
            {formatShortDate(task.dueDate)}
          </span>
        )}
      </div>
    </article>
  );
}
