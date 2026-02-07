'use client';

import { cn } from '@/lib/utils';
import type { Task, Tag } from '@/lib/types';

interface CalendarTaskBadgeProps {
  task: Task;
  tags: Tag[];
  compact?: boolean;
  onClick?: () => void;
}

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

const defaultColor = 'bg-primary/20 text-primary';

export function CalendarTaskBadge({
  task,
  tags,
  compact = false,
  onClick,
}: CalendarTaskBadgeProps) {
  // Find the first matching tag to determine badge color
  const firstTag = tags.find((tag) => task.tags.includes(tag.id));
  const colorClasses = firstTag ? (colorMap[firstTag.color] ?? defaultColor) : defaultColor;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      className={cn(
        'truncate cursor-pointer hover:opacity-80 transition-opacity',
        colorClasses,
        compact
          ? 'text-xs py-0.5 px-1.5 rounded-md'
          : 'text-sm p-2 rounded-md'
      )}
    >
      {task.title}
    </div>
  );
}
