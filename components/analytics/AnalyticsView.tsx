'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsHeader } from './AnalyticsHeader';
import { KpiCardsRow } from './KpiCardsRow';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { TagDistribution } from './TagDistribution';
import { RecentActivity } from './RecentActivity';

export function AnalyticsView() {
  const { data, dateRange, setDateRange } = useAnalytics();

  return (
    <div className="flex flex-col gap-7">
      <AnalyticsHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <KpiCardsRow
        kpis={data.kpis}
        trends={data.kpiTrends}
      />

      <WeeklyActivityChart data={data.weeklyActivity} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TagDistribution
          data={data.tagDistribution}
          totalTasks={data.totalTasksInRange}
        />
        <RecentActivity activities={data.recentActivity} />
      </div>
    </div>
  );
}
