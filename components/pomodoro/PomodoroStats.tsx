'use client';

import { Clock, Target, Coffee, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PomodoroConfig } from '@/lib/types';
import { formatMinutesAsHoursMinutes } from '@/lib/pomodoro-utils';

interface PomodoroStatsProps {
  config: PomodoroConfig;
  totalSessions: number;
}

export function PomodoroStats({ config, totalSessions }: PomodoroStatsProps) {
  const stats = [
    {
      label: 'Duración Jornada',
      value: formatMinutesAsHoursMinutes(config.totalDurationMinutes),
      icon: Clock,
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary',
    },
    {
      label: 'Focus Time',
      value: `${config.focusMinutes} min`,
      icon: Target,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      label: 'Short / Long Break',
      value: `${config.shortBreakMinutes}m / ${config.longBreakMinutes}m`,
      icon: Coffee,
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-500 dark:text-amber-400',
    },
    {
      label: 'Sesiones Totales',
      value: `${totalSessions}`,
      icon: BarChart3,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-500 dark:text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card rounded-[24px] p-5 flex items-center gap-4"
        >
          <div className={cn('w-11 h-11 rounded-[14px] flex items-center justify-center', stat.iconBg)}>
            <stat.icon className={cn('w-5 h-5', stat.iconColor)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-bold text-foreground font-heading">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
