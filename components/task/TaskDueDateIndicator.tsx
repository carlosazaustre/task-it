'use client';

interface TaskDueDateIndicatorProps {
  dueDate: string | null;
  compact?: boolean;
}

function getDueDateInfo(dueDate: string | null): {
  text: string;
  style: string;
  isOverdue: boolean;
} {
  if (!dueDate) {
    return {
      text: '\u2014', // —
      style: 'text-gray-400',
      isOverdue: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays);
    return {
      text: `Vencida hace ${daysOverdue} ${daysOverdue === 1 ? 'dia' : 'dias'}`,
      style: 'text-red-600 font-bold',
      isOverdue: true,
    };
  }

  if (diffDays === 0) {
    return {
      text: 'Vence hoy',
      style: 'text-orange-600',
      isOverdue: false,
    };
  }

  if (diffDays === 1) {
    return {
      text: 'Vence manana',
      style: 'text-amber-600',
      isOverdue: false,
    };
  }

  if (diffDays <= 7) {
    const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const dayName = dayNames[due.getDay()];
    return {
      text: `Vence el ${dayName}`,
      style: 'text-foreground',
      isOverdue: false,
    };
  }

  const day = due.getDate().toString().padStart(2, '0');
  const month = (due.getMonth() + 1).toString().padStart(2, '0');
  return {
    text: `Vence el ${day}/${month}`,
    style: 'text-foreground',
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

export function TaskDueDateIndicator({ dueDate, compact = false }: TaskDueDateIndicatorProps) {
  const { text, style, isOverdue } = getDueDateInfo(dueDate);

  if (compact) {
    const compactDate = formatCompactDate(dueDate);
    return (
      <span className={`inline-flex items-center gap-1 text-sm ${style}`}>
        {isOverdue && (
          <span aria-hidden="true" className="text-red-600">
            !
          </span>
        )}
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
        <span>{compactDate}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${style}`}>
      {isOverdue && (
        <span aria-hidden="true" className="text-red-600">
          !
        </span>
      )}
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
      <span>{text}</span>
    </span>
  );
}
