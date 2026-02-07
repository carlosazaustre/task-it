'use client';

import { Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PomodoroSession } from '@/lib/types';

interface ActiveSessionBarProps {
  session: PomodoroSession;
  taskTitle: string | null;
  onStop: () => void;
}

const sessionBadgeStyles: Record<string, string> = {
  focus: 'bg-primary/20 text-primary',
  short_break: 'bg-amber-500/20 text-amber-500 dark:text-amber-400',
  long_break: 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400',
};

export function ActiveSessionBar({ session, taskTitle, onStop }: ActiveSessionBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={cn(
            'px-3 py-1.5 rounded-[14px] text-xs font-semibold flex-shrink-0',
            sessionBadgeStyles[session.type]
          )}
        >
          {session.label}
        </span>
        {taskTitle && (
          <span className="text-sm text-foreground truncate">{taskTitle}</span>
        )}
      </div>
      <button
        onClick={onStop}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm font-medium flex-shrink-0',
          'bg-red-500/10 text-red-500 dark:text-red-400',
          'hover:bg-red-500/20 transition-colors'
        )}
      >
        <Square className="w-3.5 h-3.5" />
        Detener Jornada
      </button>
    </div>
  );
}
