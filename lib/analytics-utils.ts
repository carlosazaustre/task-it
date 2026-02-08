import type { Task, Tag, AnalyticsDateRange, KpiData, KpiTrend, DailyActivity, TagCount, ActivityItem, PomodoroState } from './types';
import { WEEKDAY_LABELS } from './constants';

export function getDateRange(range: AnalyticsDateRange): { start: Date; end: Date } {
  const now = new Date();

  if (range === 'this_week') {
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
  }

  if (range === 'last_7_days') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  if (range === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  if (range === 'last_30_days') {
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  return { start: now, end: now };
}

export function getPreviousDateRange(range: AnalyticsDateRange): { start: Date; end: Date } {
  const { start, end } = getDateRange(range);
  const duration = end.getTime() - start.getTime();

  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);

  return { start: prevStart, end: prevEnd };
}

export function filterTasksByDateRange(tasks: Task[] | null | undefined, start: Date, end: Date): Task[] {
  if (!tasks || tasks.length === 0) return [];
  return tasks.filter((task) => {
    const updated = new Date(task.updatedAt);
    return updated >= start && updated <= end;
  });
}

export function computeKpis(tasksInRange: Task[], allTasks: Task[], focusMinutes: number): KpiData {
  const completedCount = tasksInRange.filter((t) => t.status === 'completed').length;
  const completionRate = tasksInRange.length === 0 ? 0 : (completedCount / tasksInRange.length) * 100;
  const focusTimeHours = Math.round((focusMinutes / 60) * 10) / 10;
  const currentStreak = computeStreak(allTasks);

  return {
    completedCount,
    completionRate: Math.round(completionRate),
    focusTimeHours,
    currentStreak,
  };
}

export function computeStreak(tasks: Task[]): number {
  const completedDates = new Set<string>();
  for (const task of tasks) {
    if (task.status === 'completed') {
      const d = new Date(task.updatedAt);
      // Format: YYYY-MM-DD with proper month (0-indexed to 1-indexed)
      completedDates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(today);
  const todayKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

  if (!completedDates.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (!completedDates.has(yesterdayKey)) return 0;
  }

  let streak = 0;
  while (true) {
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (completedDates.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function computeKpiTrends(current: KpiData, previous: KpiData): Record<keyof KpiData, KpiTrend> {
  const fields: (keyof KpiData)[] = ['completedCount', 'completionRate', 'focusTimeHours', 'currentStreak'];

  const trends: Record<string, KpiTrend> = {};

  for (const field of fields) {
    const value = Math.round(current[field] - previous[field]);
    trends[field] = {
      value,
      isPositive: value >= 0,
    };
  }

  return trends as Record<keyof KpiData, KpiTrend>;
}

// Helper to check if a task falls within a specific week's day
function isTaskInWeekday(taskDate: Date, weekStart: Date, dayOffset: number): boolean {
  const dayStart = new Date(weekStart);
  dayStart.setDate(weekStart.getDate() + dayOffset);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  return taskDate >= dayStart && taskDate <= dayEnd;
}

export function computeWeeklyActivity(tasks: Task[], weekStart: Date): DailyActivity[] {
  const activity: DailyActivity[] = WEEKDAY_LABELS.map((label, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return {
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dayLabel: label,
      completed: 0,
      pending: 0,
    };
  });

  for (const task of tasks) {
    if (task.status === 'completed') {
      const updated = new Date(task.updatedAt);
      const dayIndex = (updated.getDay() + 6) % 7;

      if (isTaskInWeekday(updated, weekStart, dayIndex)) {
        activity[dayIndex].completed++;
      }
    } else {
      const created = new Date(task.createdAt);
      const dayIndex = (created.getDay() + 6) % 7;

      if (isTaskInWeekday(created, weekStart, dayIndex)) {
        activity[dayIndex].pending++;
      }
    }
  }

  return activity;
}

export function computeTagDistribution(tasks: Task[] | null | undefined, tags: Tag[] | null | undefined): TagCount[] {
  if (!tasks || !tags || tasks.length === 0 || tags.length === 0) return [];

  const tagCounts = new Map<string, number>();

  for (const task of tasks) {
    for (const tagId of task.tags) {
      tagCounts.set(tagId, (tagCounts.get(tagId) || 0) + 1);
    }
  }

  const distribution: TagCount[] = [];

  for (const tag of tags) {
    const count = tagCounts.get(tag.id) || 0;
    if (count > 0) {
      distribution.push({
        tagId: tag.id,
        tagName: tag.name,
        tagColor: tag.color,
        count,
      });
    }
  }

  return distribution.sort((a, b) => b.count - a.count);
}

export function computeRecentActivity(tasks: Task[], maxItems: number): ActivityItem[] {
  const activities: ActivityItem[] = [];

  for (const task of tasks) {
    if (task.status === 'completed') {
      activities.push({
        id: `${task.id}-completed`,
        action: 'completed',
        title: task.title,
        timestamp: task.updatedAt,
        meta: `Completada · ${formatRelativeTime(task.updatedAt)}`,
      });
    }

    activities.push({
      id: `${task.id}-created`,
      action: 'created',
      title: task.title,
      timestamp: task.createdAt,
      meta: `Creada · ${formatRelativeTime(task.createdAt)}`,
    });
  }

  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, maxItems);
}

export function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Hace un momento';
  if (diffMinutes < 60) return `Hace ${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;

  const diffWeeks = Math.floor(diffDays / 7);
  return `Hace ${diffWeeks} semanas`;
}

export function computePomodoroFocusMinutes(pomodoroState: PomodoroState | null): number {
  if (!pomodoroState || pomodoroState.phase === 'setup') return 0;

  let totalMinutes = 0;
  for (let i = 0; i <= pomodoroState.currentSessionIndex; i++) {
    const session = pomodoroState.sessions[i];
    if (session && session.type === 'focus') {
      totalMinutes += session.durationMinutes;
    }
  }

  return totalMinutes;
}

/**
 * Formats a KPI trend for display with sign and unit suffix
 * Returns null if trend value is 0 (no change)
 */
export function formatTrend(trend: KpiTrend, suffix: string = ''): { value: string; isPositive: boolean } | null {
  if (trend.value === 0) return null;
  const sign = trend.value > 0 ? '+' : '';
  return {
    value: `${sign}${Math.round(trend.value)}${suffix}`,
    isPositive: trend.isPositive,
  };
}
