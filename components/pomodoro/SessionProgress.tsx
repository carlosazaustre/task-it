'use client';

import { cn } from '@/lib/utils';
import type { PomodoroSession } from '@/lib/types';
import { formatMinutesAsHoursMinutes } from '@/lib/pomodoro-utils';

interface SessionProgressProps {
  sessions: PomodoroSession[];
  currentIndex: number;
}

const dotColors: Record<string, string> = {
  focus: 'bg-primary',
  short_break: 'bg-amber-500',
  long_break: 'bg-emerald-500',
};

export function SessionProgress({ sessions, currentIndex }: SessionProgressProps) {
  // Calculate remaining time in the jornada
  const remainingMinutes = sessions
    .slice(currentIndex)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const currentSessionNumber = sessions
    .slice(0, currentIndex + 1)
    .filter((s) => s.type === 'focus').length;

  const totalFocusSessions = sessions.filter((s) => s.type === 'focus').length;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {sessions.map((session, index) => (
          <div
            key={session.index}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-all',
              index < currentIndex
                ? 'bg-muted-foreground/30'
                : index === currentIndex
                  ? cn(dotColors[session.type], 'ring-2 ring-offset-2 ring-offset-background', session.type === 'focus' ? 'ring-primary' : session.type === 'short_break' ? 'ring-amber-500' : 'ring-emerald-500')
                  : cn(dotColors[session.type], 'opacity-40')
            )}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Sesion {currentSessionNumber} de {totalFocusSessions} · Jornada: {formatMinutesAsHoursMinutes(remainingMinutes)} restantes
      </p>
    </div>
  );
}
