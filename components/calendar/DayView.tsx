'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { groupTasksByDate } from '@/lib/calendar-utils';
import { DayTimeline } from '@/components/calendar/DayTimeline';
import { MiniCalendar } from '@/components/calendar/MiniCalendar';
import type { Task, Tag } from '@/lib/types';

interface DayViewProps {
  date: Date;
  tasks: Task[];
  allTasks: Task[];
  tags: Tag[];
  onDateSelect: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}

const statusDotColors: Record<Task['status'], string> = {
  pending: 'bg-amber-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
};

export function DayView(props: DayViewProps) {
  const { date, tasks, allTasks, tags, onDateSelect, onTaskClick } = props;
  // Build tasksPerDay map from allTasks for the MiniCalendar dots
  const tasksPerDay = useMemo(() => {
    const grouped = groupTasksByDate(allTasks);
    const countMap = new Map<string, number>();
    for (const [key, taskList] of grouped) {
      countMap.set(key, taskList.length);
    }
    return countMap;
  }, [allTasks]);

  // Current month derived from selected date
  const currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  // Find tag color for a task's first tag
  const getFirstTagColor = (task: Task): string | null => {
    const tag = tags.find((t) => task.tags.includes(t.id));
    return tag ? tag.color : null;
  };

  const tagColorDotMap: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    yellow: 'bg-yellow-500',
    lime: 'bg-lime-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
    sky: 'bg-sky-500',
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    violet: 'bg-primary',
    purple: 'bg-primary',
    fuchsia: 'bg-fuchsia-500',
    pink: 'bg-pink-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left column: DayTimeline */}
      <DayTimeline
        date={date}
        tasks={tasks}
        tags={tags}
        onTaskClick={onTaskClick}
      />

      {/* Right sidebar */}
      <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
        {/* Mini calendar */}
        <MiniCalendar
          currentMonth={currentMonth}
          selectedDate={date}
          tasksPerDay={tasksPerDay}
          onDateSelect={onDateSelect}
          onMonthChange={(newMonth) => {
            // Navigate to first day of the new month
            onDateSelect(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1));
          }}
        />

        {/* Task list for the day */}
        <div className="bg-card rounded-[16px] p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Tareas del día
          </h3>

          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay tareas para este día
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const tagColor = getFirstTagColor(task);

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg text-left transition-colors hover:bg-secondary w-full',
                      isCompleted && 'opacity-60'
                    )}
                  >
                    {/* Status indicator dot */}
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        statusDotColors[task.status]
                      )}
                    />

                    {/* Tag color dot */}
                    {tagColor && (
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full shrink-0',
                          tagColorDotMap[tagColor] ?? 'bg-primary'
                        )}
                      />
                    )}

                    {/* Task title */}
                    <span
                      className={cn(
                        'text-sm truncate',
                        isCompleted
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      )}
                    >
                      {task.title}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
