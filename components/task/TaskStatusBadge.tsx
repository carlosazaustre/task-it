'use client';

import type { TaskStatus } from '@/lib/types';
import { TASK_STATUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  onClick?: () => void;
  interactive?: boolean;
  className?: string;
}

// V3 Minimal Vibrant - Status colors with transparency backgrounds
const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string; border: string; icon: string }> = {
  pending: {
    bg: 'bg-[#F59E0B]/10',
    text: 'text-[#F59E0B]',
    border: 'border-[#F59E0B]/20',
    icon: '\u25CB', // Circle outline
  },
  in_progress: {
    bg: 'bg-[#3B82F6]/10',
    text: 'text-[#3B82F6]',
    border: 'border-[#3B82F6]/20',
    icon: '\u25D0', // Half circle
  },
  completed: {
    bg: 'bg-[#22C55E]/10',
    text: 'text-[#22C55E]',
    border: 'border-[#22C55E]/20',
    icon: '\u2713', // Checkmark
  },
};

export function TaskStatusBadge({
  status,
  onClick,
  interactive = false,
  className
}: TaskStatusBadgeProps) {
  const styles = STATUS_STYLES[status];
  const statusLabel = TASK_STATUSES.find((s) => s.value === status)?.label || status;

  const baseClasses = cn(
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border',
    styles.bg,
    styles.text,
    styles.border,
    className
  );

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    : '';

  if (interactive && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(baseClasses, interactiveClasses)}
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
