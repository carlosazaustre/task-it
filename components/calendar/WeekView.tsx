'use client';

import { cn } from '@/lib/utils';
import { getWeekDates, getDayHours, getTasksForDate, formatHour, isToday } from '@/lib/calendar-utils';
import { CALENDAR_DEFAULTS, WEEKDAY_LETTERS } from '@/lib/constants';
import { CalendarTaskBadge } from '@/components/calendar/CalendarTaskBadge';
import type { Task, Tag } from '@/lib/types';

interface WeekViewProps {
  weekStart: Date;
  tasks: Task[];
  tags: Tag[];
  onTaskClick: (task: Task) => void;
}

export function WeekView({ weekStart, tasks, tags, onTaskClick }: WeekViewProps) {
  const weekDates = getWeekDates(weekStart);
  const hours = getDayHours(CALENDAR_DEFAULTS.START_HOUR, CALENDAR_DEFAULTS.END_HOUR);

  // Pre-compute tasks for each day
  const tasksByDay = weekDates.map((date) => getTasksForDate(tasks, date));

  return (
    <div className="bg-card rounded-[16px] overflow-hidden border border-border">
      {/* Header row: empty cell + 7 day columns */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
        {/* Empty corner cell */}
        <div className="border-r border-border" />

        {/* Day header cells */}
        {weekDates.map((date, i) => {
          const dayIsToday = isToday(date);
          return (
            <div
              key={date.toISOString()}
              className={cn(
                'flex flex-col items-center justify-center py-3 gap-1',
                i < 6 && 'border-r border-border',
                dayIsToday && 'bg-primary/5'
              )}
            >
              <span className="text-xs font-medium text-muted-foreground">
                {WEEKDAY_LETTERS[i]}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold flex items-center justify-center',
                  dayIsToday
                    ? 'bg-primary text-white w-8 h-8 rounded-full'
                    : 'text-foreground'
                )}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* All-day row */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
        {/* Label */}
        <div className="flex items-start justify-end pr-2 pt-2 border-r border-border">
          <span className="text-xs text-muted-foreground">ALL</span>
        </div>

        {/* Task cells */}
        {weekDates.map((date, i) => {
          const dayTasks = tasksByDay[i];
          const dayIsToday = isToday(date);
          return (
            <div
              key={date.toISOString()}
              className={cn(
                'min-h-[48px] p-1 flex flex-col gap-1',
                i < 6 && 'border-r border-border',
                dayIsToday && 'bg-primary/5'
              )}
            >
              {dayTasks.map((task) => (
                <CalendarTaskBadge
                  key={task.id}
                  task={task}
                  tags={tags}
                  compact={false}
                  onClick={() => onTaskClick(task)}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Hour grid (scrollable) */}
      <div className="overflow-y-auto max-h-[480px]">
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border last:border-b-0"
            style={{ height: `${CALENDAR_DEFAULTS.WEEK_HOUR_HEIGHT_PX}px` }}
          >
            {/* Hour label */}
            <div className="flex items-start justify-end pr-2 pt-1 border-r border-border">
              <span className="text-xs text-muted-foreground">{formatHour(hour)}</span>
            </div>

            {/* Empty day columns */}
            {weekDates.map((date, i) => {
              const dayIsToday = isToday(date);
              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    i < 6 && 'border-r border-border',
                    dayIsToday && 'bg-primary/5'
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
