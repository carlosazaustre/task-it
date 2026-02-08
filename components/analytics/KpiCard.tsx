import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
  trend: {
    value: string;
    isPositive: boolean;
  } | null;
}

export function KpiCard({ label, value, icon, iconBgClass, iconColorClass, trend }: KpiCardProps) {
  return (
    <div className="bg-secondary rounded-[24px] p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBgClass)}>
          <div className={cn('w-5 h-5', iconColorClass)}>{icon}</div>
        </div>
        {trend && (
          <span
            className={cn(
              'rounded-xl px-2 py-1 flex items-center gap-1 text-xs font-semibold',
              trend.isPositive
                ? 'bg-green-500/20 text-green-500 dark:text-green-400'
                : 'bg-red-500/20 text-red-500 dark:text-red-400'
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-[32px] font-bold font-heading text-foreground leading-tight">{value}</p>
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
