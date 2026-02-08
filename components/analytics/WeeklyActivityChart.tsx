import type { DailyActivity } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WeeklyActivityChartProps {
  data: DailyActivity[];
}

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  const maxValue = Math.max(...data.flatMap(d => [d.completed, d.pending]), 1);
  const barHeight = (value: number) => Math.max((value / maxValue) * 180, value > 0 ? 4 : 0);
  const isEmpty = data.every(d => d.completed === 0 && d.pending === 0);

  const today = new Date();
  const todayDay = today.getDay();
  // Convert JS day (0=Sun) to our index (0=Mon)
  const todayIndex = todayDay === 0 ? 6 : todayDay - 1;

  return (
    <div className="bg-secondary rounded-[24px] p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <h3 className="text-lg font-bold font-heading text-foreground">Actividad Semanal</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[5px] bg-primary" />
            <span className="text-xs text-muted-foreground">Completadas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[5px] bg-border" />
            <span className="text-xs text-muted-foreground">Pendientes</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative flex items-end justify-around h-[200px] px-4">
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Sin actividad esta semana</p>
          </div>
        )}
        {data.map((day, index) => (
          <div key={day.date} className="flex flex-col items-center gap-2">
            <div className="flex items-end gap-1">
              <div
                className="bg-primary rounded-t-[8px] w-7 transition-all"
                style={{ height: barHeight(day.completed) }}
              />
              <div
                className="bg-border rounded-t-[8px] w-7 transition-all"
                style={{ height: barHeight(day.pending) }}
              />
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                index === todayIndex
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              {day.dayLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
