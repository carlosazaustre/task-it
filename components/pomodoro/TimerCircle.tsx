'use client';

import { cn } from '@/lib/utils';
import { formatSecondsAsTimer } from '@/lib/pomodoro-utils';
import type { PomodoroSessionType } from '@/lib/types';

interface TimerCircleProps {
  timeRemainingSeconds: number;
  totalSeconds: number;
  sessionType: PomodoroSessionType;
  label: string;
}

const strokeColors: Record<string, string> = {
  focus: 'stroke-primary',
  short_break: 'stroke-amber-500',
  long_break: 'stroke-emerald-500',
};

export function TimerCircle({ timeRemainingSeconds, totalSeconds, sessionType, label }: TimerCircleProps) {
  const size = 280;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? timeRemainingSeconds / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn('transition-all duration-1000', strokeColors[sessionType])}
          />
        </svg>
        {/* Timer text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[64px] font-bold font-heading text-foreground leading-none tabular-nums">
            {formatSecondsAsTimer(timeRemainingSeconds)}
          </span>
          <span className="text-sm text-muted-foreground mt-2">{label}</span>
        </div>
      </div>
    </div>
  );
}
