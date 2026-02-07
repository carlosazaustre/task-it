'use client';

import { cn } from '@/lib/utils';
import { CalendarTaskBadge } from './CalendarTaskBadge';
import type { Task, Tag } from '@/lib/types';

interface MonthDayCellProps {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  tasks: Task[];
  tags: Tag[];
  onDayClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}

const MAX_VISIBLE_TASKS = 2;

export function MonthDayCell({
  date,
  isToday,
  isCurrentMonth,
  tasks,
  tags,
  onDayClick,
  onTaskClick,
}: MonthDayCellProps) {
  const visibleTasks = tasks.slice(0, MAX_VISIBLE_TASKS);
  const remaining = tasks.length - MAX_VISIBLE_TASKS;

  return (
    <div
      className={cn(
        'h-20 sm:h-24 lg:h-28 p-1.5 border-b border-r border-border cursor-pointer',
        'hover:bg-secondary/50 transition-colors',
        !isCurrentMonth && 'opacity-50'
      )}
      onClick={() => onDayClick(date)}
    >
      {/* Day number */}
      <div className="flex justify-start mb-1">
        <span
          className={cn(
            'w-7 h-7 flex items-center justify-center text-sm font-medium',
            isToday
              ? 'bg-primary text-white rounded-full'
              : isCurrentMonth
                ? 'text-foreground'
                : 'text-muted-foreground'
          )}
        >
          {date.getDate()}
        </span>
      </div>

      {/* Task badges */}
      <div className="flex flex-col gap-0.5 overflow-hidden">
        {visibleTasks.map((task) => (
          <CalendarTaskBadge
            key={task.id}
            task={task}
            tags={tags}
            compact
            onClick={() => onTaskClick(task)}
          />
        ))}
        {remaining > 0 && (
          <span className="text-xs text-muted-foreground px-1">
            +{remaining} mas
          </span>
        )}
      </div>
    </div>
  );
}
