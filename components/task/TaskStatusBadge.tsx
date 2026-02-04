'use client';

import type { TaskStatus } from '@/lib/types';
import { TASK_STATUSES } from '@/lib/constants';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  onClick?: () => void;
  interactive?: boolean;
}

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string; icon: string }> = {
  pending: {
    bg: 'bg-amber-100 dark:bg-amber-900',
    text: 'text-amber-800 dark:text-amber-200',
    icon: '\u25CB', // ○
  },
  in_progress: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-200',
    icon: '\u25D0', // ◐
  },
  completed: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    icon: '\u2713', // ✓
  },
};

export function TaskStatusBadge({ status, onClick, interactive = false }: TaskStatusBadgeProps) {
  const styles = STATUS_STYLES[status];
  const statusLabel = TASK_STATUSES.find((s) => s.value === status)?.label || status;

  const baseClasses = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.text}`;
  const interactiveClasses = interactive
    ? 'cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    : '';

  if (interactive && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} ${interactiveClasses}`}
        role="button"
        aria-pressed={status === 'completed'}
        aria-label={`Estado: ${statusLabel}. Click para cambiar estado`}
      >
        <span aria-hidden="true">{styles.icon}</span>
        <span>{statusLabel}</span>
      </button>
    );
  }

  return (
    <span className={baseClasses} role="status">
      <span aria-hidden="true">{styles.icon}</span>
      <span>{statusLabel}</span>
    </span>
  );
}
