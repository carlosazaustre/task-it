'use client';

import { useMemo } from 'react';
import { MonthDayCell } from './MonthDayCell';
import { getMonthGrid, groupTasksByDate, dateToKey, isSameMonth, isToday } from '@/lib/calendar-utils';
import { WEEKDAY_LABELS } from '@/lib/constants';
import type { Task, Tag } from '@/lib/types';

interface MonthViewProps {
  currentDate: Date;
  tasks: Task[];
  tags: Tag[];
  onDayClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}

export function MonthView({
  currentDate,
  tasks,
  tags,
  onDayClick,
  onTaskClick,
}: MonthViewProps) {
  const grid = useMemo(
    () => getMonthGrid(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate]
  );

  const taskMap = useMemo(() => groupTasksByDate(tasks), [tasks]);

  return (
    <div className="bg-card rounded-[16px] overflow-hidden border border-border">
      {/* Weekday header */}
      <div className="grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-3 text-center text-xs font-semibold text-muted-foreground border-b border-border"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {grid.flat().map((date, i) => {
          const key = dateToKey(date);
          const dayTasks = taskMap.get(key) || [];

          return (
            <MonthDayCell
              key={i}
              date={date}
              isToday={isToday(date)}
              isCurrentMonth={isSameMonth(date, currentDate)}
              tasks={dayTasks}
              tags={tags}
              onDayClick={onDayClick}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>
    </div>
  );
}
