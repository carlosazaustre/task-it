'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, isSameDay } from '@/lib/utils';
import { getMonthGrid, isSameMonth, addMonths, formatMonthYear, dateToKey } from '@/lib/calendar-utils';
import { WEEKDAY_LETTERS } from '@/lib/constants';

interface MiniCalendarProps {
  currentMonth: Date;
  selectedDate: Date;
  tasksPerDay: Map<string, number>;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export function MiniCalendar({
  currentMonth,
  selectedDate,
  tasksPerDay,
  onDateSelect,
  onMonthChange,
}: MiniCalendarProps) {
  const today = new Date();
  const grid = getMonthGrid(currentMonth.getFullYear(), currentMonth.getMonth());

  return (
    <div className="bg-card rounded-[16px] p-4">
      {/* Header: month/year + navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(currentMonth, -1))}
          className="w-7 h-7 rounded-full bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={14} />
        </button>

        <span className="text-sm font-semibold text-foreground">
          {formatMonthYear(currentMonth)}
        </span>

        <button
          type="button"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="w-7 h-7 rounded-full bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Weekday letters header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LETTERS.map((letter) => (
          <div
            key={letter}
            className="text-xs text-muted-foreground font-medium text-center py-1"
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div className="grid grid-cols-7">
        {grid.map((week, weekIdx) =>
          week.map((day, dayIdx) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isSameDay(day, today);
            const key = dateToKey(day);
            const hasTasks = (tasksPerDay.get(key) ?? 0) > 0;

            return (
              <button
                key={`${weekIdx}-${dayIdx}`}
                type="button"
                onClick={() => onDateSelect(day)}
                className={cn(
                  'relative flex flex-col items-center justify-center w-8 h-8 mx-auto text-sm transition-colors rounded-full',
                  !isCurrentMonth && 'text-muted-foreground opacity-50',
                  isCurrentMonth && !isSelected && !isTodayDate && 'text-foreground hover:bg-secondary',
                  isTodayDate && !isSelected && 'border border-primary text-primary',
                  isSelected && 'bg-primary text-white'
                )}
                aria-label={day.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              >
                <span className="leading-none">{day.getDate()}</span>
                {hasTasks && (
                  <span
                    className={cn(
                      'absolute bottom-0.5 w-1 h-1 rounded-full',
                      isSelected ? 'bg-white' : 'bg-primary'
                    )}
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
