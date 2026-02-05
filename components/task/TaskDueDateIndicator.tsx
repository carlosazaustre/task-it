'use client';

import { cn } from '@/lib/utils';

interface TaskDueDateIndicatorProps {
  dueDate: string | null;
  compact?: boolean;
  className?: string;
}

function getDueDateInfo(dueDate: string | null): {
  text: string;
  style: string;
  isOverdue: boolean;
} {
  if (!dueDate) {
    return {
      text: '\u2014', // Em dash
      style: 'text-muted-foreground',
      isOverdue: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Overdue
  if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays);
    return {
      text: `Vencida hace ${daysOverdue} ${daysOverdue === 1 ? 'dia' : 'dias'}`,
      style: 'text-[#EF4444] font-semibold',
      isOverdue: true,
    };
  }

  // Due today
  if (diffDays === 0) {
    return {
      text: 'Vence hoy',
      style: 'text-[#F59E0B] font-medium',
      isOverdue: false,
    };
  }

  // Due tomorrow
  if (diffDays === 1) {
    return {
      text: 'Vence manana',
      style: 'text-[#F59E0B]',
      isOverdue: false,
    };
  }

  // Due within a week
  if (diffDays <= 7) {
    const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const dayName = dayNames[due.getDay()];
    return {
      text: `Vence el ${dayName}`,
      style: 'text-foreground',
      isOverdue: false,
    };
  }

  // Due later
  const day = due.getDate().toString().padStart(2, '0');
  const month = (due.getMonth() + 1).toString().padStart(2, '0');
  return {
    text: `Vence el ${day}/${month}`,
    style: 'text-muted-foreground',
    isOverdue: false,
  };
}

function formatCompactDate(dueDate: string | null): string {
  if (!dueDate) return '\u2014';

  const due = new Date(dueDate);
  const day = due.getDate().toString().padStart(2, '0');
  const month = (due.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
}

// Calendar icon defined outside render to avoid recreation
function CalendarIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

export function TaskDueDateIndicator({
  dueDate,
  compact = false,
  className
}: TaskDueDateIndicatorProps) {
  const { text, style, isOverdue } = getDueDateInfo(dueDate);

  if (compact) {
    const compactDate = formatCompactDate(dueDate);
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-sm',
          style,
          className
        )}
      >
        {isOverdue && (
          <span aria-hidden="true" className="text-[#EF4444] font-bold">
            !
          </span>
        )}
        <CalendarIcon />
        <span>{compactDate}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-sm',
        style,
        className
      )}
    >
      {isOverdue && (
        <span aria-hidden="true" className="text-[#EF4444] font-bold">
          !
        </span>
      )}
      <CalendarIcon />
      <span>{text}</span>
    </span>
  );
}
