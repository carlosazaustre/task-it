import { CircleCheck, Target, Brain, Flame } from 'lucide-react';
import { KpiCard } from './KpiCard';
import { formatTrend } from '@/lib/analytics-utils';
import type { KpiData, KpiTrend } from '@/lib/types';

interface KpiCardsRowProps {
  kpis: KpiData;
  trends: Record<keyof KpiData, KpiTrend>;
}

export function KpiCardsRow({ kpis, trends }: KpiCardsRowProps) {
  const cards = [
    {
      label: 'Tareas Completadas',
      value: `${kpis.completedCount}`,
      icon: <CircleCheck className="w-5 h-5" />,
      iconBgClass: 'bg-violet-500/20',
      iconColorClass: 'text-violet-500 dark:text-violet-400',
      trend: formatTrend(trends.completedCount),
    },
    {
      label: 'Tasa de Completado',
      value: `${Math.round(kpis.completionRate)}%`,
      icon: <Target className="w-5 h-5" />,
      iconBgClass: 'bg-green-500/20',
      iconColorClass: 'text-green-500 dark:text-green-400',
      trend: formatTrend(trends.completionRate, '%'),
    },
    {
      label: 'Tiempo de Focus',
      value: `${kpis.focusTimeHours}h`,
      icon: <Brain className="w-5 h-5" />,
      iconBgClass: 'bg-amber-500/20',
      iconColorClass: 'text-amber-500 dark:text-amber-400',
      trend: formatTrend(trends.focusTimeHours, 'h'),
    },
    {
      label: 'Racha Actual',
      value: `${kpis.currentStreak} días`,
      icon: <Flame className="w-5 h-5" />,
      iconBgClass: 'bg-red-500/20',
      iconColorClass: 'text-red-500 dark:text-red-400',
      trend: formatTrend(trends.currentStreak),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
