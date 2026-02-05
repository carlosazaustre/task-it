'use client';

import type { TaskPriority } from '@/lib/types';
import { TASK_PRIORITIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  showLabel?: boolean;
  className?: string;
}

// V3 Minimal Vibrant - Priority colors
const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; border: string; icon: string }> = {
  high: {
    bg: 'bg-[#EF4444]/10',
    text: 'text-[#EF4444]',
    border: 'border-[#EF4444]/20',
    icon: '\u25B2', // Triangle up
  },
  medium: {
    bg: 'bg-[#F59E0B]/10',
    text: 'text-[#F59E0B]',
    border: 'border-[#F59E0B]/20',
    icon: '\u25CF', // Circle filled
  },
  low: {
    bg: 'bg-[#9CA3AF]/10',
    text: 'text-[#9CA3AF]',
    border: 'border-[#9CA3AF]/20',
    icon: '\u25BC', // Triangle down
  },
};

export function TaskPriorityBadge({
  priority,
  showLabel = false,
  className
}: TaskPriorityBadgeProps) {
  const styles = PRIORITY_STYLES[priority];
  const priorityLabel = TASK_PRIORITIES.find((p) => p.value === priority)?.label || priority;

  if (showLabel) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
          styles.bg,
          styles.text,
          styles.border,
          className
        )}
        title={priorityLabel}
        aria-label={`Prioridad: ${priorityLabel}`}
      >
        <span aria-hidden="true" className="text-xs">
          {styles.icon}
        </span>
        <span>{priorityLabel}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-6 h-6 rounded-full',
        styles.bg,
        styles.text,
        className
      )}
      title={priorityLabel}
      aria-label={`Prioridad: ${priorityLabel}`}
    >
      <span aria-hidden="true" className="text-xs">
        {styles.icon}
      </span>
    </span>
  );
}
