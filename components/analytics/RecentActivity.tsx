import { CircleCheck, CirclePlus, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityItem, ActivityActionType } from '@/lib/types';

interface RecentActivityProps {
  activities: ActivityItem[];
}

const ACTION_CONFIG: Record<ActivityActionType, {
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}> = {
  completed: {
    icon: <CircleCheck className="w-4 h-4" />,
    iconBgClass: 'bg-green-500/20',
    iconColorClass: 'text-green-500 dark:text-green-400',
  },
  created: {
    icon: <CirclePlus className="w-4 h-4" />,
    iconBgClass: 'bg-violet-500/20',
    iconColorClass: 'text-violet-500 dark:text-violet-400',
  },
  pomodoro: {
    icon: <Timer className="w-4 h-4" />,
    iconBgClass: 'bg-amber-500/20',
    iconColorClass: 'text-amber-500 dark:text-amber-400',
  },
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-secondary rounded-[24px] p-6 flex flex-col gap-4 flex-1">
      <h3 className="text-lg font-bold font-heading text-foreground">Actividad Reciente</h3>

      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Sin actividad reciente</p>
      ) : (
        <div className="flex flex-col gap-1">
          {activities.map((item) => {
            const config = ACTION_CONFIG[item.action];
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-background rounded-[14px] px-3.5 py-3"
              >
                <div className={cn('w-8 h-8 rounded-[10px] flex items-center justify-center', config.iconBgClass)}>
                  <div className={config.iconColorClass}>{config.icon}</div>
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.meta}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
