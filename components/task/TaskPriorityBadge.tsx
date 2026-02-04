'use client';

import type { TaskPriority } from '@/lib/types';
import { TASK_PRIORITIES } from '@/lib/constants';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  showLabel?: boolean;
}

const PRIORITY_STYLES: Record<TaskPriority, { color: string; icon: string }> = {
  high: {
    color: 'text-red-500',
    icon: '\u25B2', // ▲
  },
  medium: {
    color: 'text-amber-500',
    icon: '\u25CF', // ●
  },
  low: {
    color: 'text-gray-400',
    icon: '\u25BC', // ▼
  },
};

export function TaskPriorityBadge({ priority, showLabel = false }: TaskPriorityBadgeProps) {
  const styles = PRIORITY_STYLES[priority];
  const priorityLabel = TASK_PRIORITIES.find((p) => p.value === priority)?.label || priority;

  return (
    <span
      className={`inline-flex items-center gap-1 ${styles.color}`}
      title={priorityLabel}
      aria-label={`Prioridad: ${priorityLabel}`}
    >
      <span aria-hidden="true" className="text-sm">
        {styles.icon}
      </span>
      {showLabel && <span className="text-sm font-medium">{priorityLabel}</span>}
    </span>
  );
}
