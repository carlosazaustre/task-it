'use client';

import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useTasks } from './useTasks';
import { useTags } from './useTags';
import type { AnalyticsDateRange, AnalyticsData, PomodoroState } from '@/lib/types';
import { STORAGE_KEYS, ANALYTICS_DEFAULTS } from '@/lib/constants';
import {
  getDateRange,
  getPreviousDateRange,
  filterTasksByDateRange,
  computeKpis,
  computeKpiTrends,
  computeWeeklyActivity,
  computeTagDistribution,
  computeRecentActivity,
  computePomodoroFocusMinutes,
} from '@/lib/analytics-utils';

export function useAnalytics() {
  const { tasks } = useTasks();
  const { tags } = useTags();

  const [dateRange, setDateRange] = useLocalStorage<AnalyticsDateRange>(
    STORAGE_KEYS.ANALYTICS_DATE_RANGE,
    ANALYTICS_DEFAULTS.DATE_RANGE
  );

  const [pomodoroState] = useLocalStorage<PomodoroState | null>(
    STORAGE_KEYS.POMODORO_STATE,
    null
  );

  const data: AnalyticsData = useMemo(() => {
    const { start, end } = getDateRange(dateRange);
    const { start: prevStart, end: prevEnd } = getPreviousDateRange(dateRange);

    const tasksInRange = filterTasksByDateRange(tasks, start, end);
    const tasksInPrevRange = filterTasksByDateRange(tasks, prevStart, prevEnd);

    const focusMinutes = computePomodoroFocusMinutes(pomodoroState);

    const kpis = computeKpis(tasksInRange, tasks, focusMinutes);
    const prevKpis = computeKpis(tasksInPrevRange, tasks, 0);
    const kpiTrends = computeKpiTrends(kpis, prevKpis);

    const weekStart = getDateRange('this_week').start;
    const weeklyActivity = computeWeeklyActivity(tasks, weekStart);

    const tagDistribution = computeTagDistribution(tasksInRange, tags);
    const recentActivity = computeRecentActivity(
      tasks,
      ANALYTICS_DEFAULTS.MAX_RECENT_ACTIVITIES
    );

    return {
      kpis,
      kpiTrends,
      weeklyActivity,
      tagDistribution,
      recentActivity,
      totalTasksInRange: tasksInRange.length,
    };
  }, [tasks, tags, dateRange, pomodoroState]);

  return useMemo(
    () => ({ data, dateRange, setDateRange }),
    [data, dateRange, setDateRange]
  );
}
