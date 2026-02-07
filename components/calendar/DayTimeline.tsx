'use client';

import { getDayHours, formatHour } from '@/lib/calendar-utils';
import { CALENDAR_DEFAULTS } from '@/lib/constants';
import { CalendarTaskBadge } from '@/components/calendar/CalendarTaskBadge';
import type { Task, Tag } from '@/lib/types';

interface DayTimelineProps {
  date: Date;
  tasks: Task[];
  tags: Tag[];
  onTaskClick: (task: Task) => void;
}

export function DayTimeline({ tasks, tags, onTaskClick }: DayTimelineProps) {
  const hours = getDayHours(CALENDAR_DEFAULTS.START_HOUR, CALENDAR_DEFAULTS.END_HOUR);

  return (
    <div className="bg-card rounded-[16px] overflow-hidden border border-border flex-1 flex flex-col">
      {/* All-day section */}
      {tasks.length > 0 && (
        <div className="border-b border-border">
          <div className="flex">
            {/* Left column: label */}
            <div className="w-[60px] shrink-0 flex items-start justify-end pr-3 pt-3">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Todo el día
              </span>
            </div>

            {/* Right area: task badges */}
            <div className="flex-1 border-l border-border p-3 flex flex-col gap-2">
              {tasks.map((task) => (
                <CalendarTaskBadge
                  key={task.id}
                  task={task}
                  tags={tags}
                  compact={false}
                  onClick={() => onTaskClick(task)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scrollable hour rows */}
      <div className="overflow-y-auto flex-1">
        {hours.map((hour) => (
          <div
            key={hour}
            className="flex border-b border-border last:border-b-0"
            style={{ height: `${CALENDAR_DEFAULTS.HOUR_HEIGHT_PX}px` }}
          >
            {/* Left column: hour label */}
            <div className="w-[60px] shrink-0 flex items-start justify-end pr-3 pt-2">
              <span className="text-xs text-muted-foreground">
                {formatHour(hour)}
              </span>
            </div>

            {/* Right area: empty hour slot */}
            <div className="flex-1 border-l border-border" />
          </div>
        ))}
      </div>
    </div>
  );
}
