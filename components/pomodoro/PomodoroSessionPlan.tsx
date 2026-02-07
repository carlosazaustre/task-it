'use client';

import { cn } from '@/lib/utils';
import type { PomodoroSession, Task } from '@/lib/types';

interface PomodoroSessionPlanProps {
  sessions: PomodoroSession[];
  tasks: Task[];
}

const sessionDotColor: Record<string, string> = {
  focus: 'bg-primary',
  short_break: 'bg-amber-500',
  long_break: 'bg-emerald-500',
};

const sessionBgColor: Record<string, string> = {
  focus: 'bg-background',
  short_break: 'bg-background',
  long_break: 'bg-emerald-500/10',
};

export function PomodoroSessionPlan({ sessions, tasks }: PomodoroSessionPlanProps) {
  const getTaskTitle = (taskId: string | null) => {
    if (!taskId) return null;
    const task = tasks.find((t) => t.id === taskId);
    return task?.title ?? null;
  };

  if (sessions.length === 0) {
    return (
      <div className="w-full lg:w-[320px] flex-shrink-0">
        <h2 className="text-lg font-bold font-heading text-foreground mb-4">
          Plan de Sesiones
        </h2>
        <div className="bg-card rounded-[24px] p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Configura tu jornada para ver el plan
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[320px] flex-shrink-0">
      <h2 className="text-lg font-bold font-heading text-foreground mb-4">
        Plan de Sesiones
      </h2>
      <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
        {sessions.map((session) => {
          const taskTitle = getTaskTitle(session.taskId);
          return (
            <div
              key={session.index}
              className={cn(
                'rounded-[14px] px-4 py-3 flex items-center gap-3',
                sessionBgColor[session.type]
              )}
            >
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full flex-shrink-0',
                  sessionDotColor[session.type]
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{session.label}</p>
                {taskTitle && (
                  <p className="text-xs text-muted-foreground truncate">{taskTitle}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {session.durationMinutes}m
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
