'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import {
  formatMonthYear,
  formatWeekRange,
  formatDayFull,
  getMonthDateRange,
  getWeekDateRange,
  getDayDateRange,
  getWeekStart,
  addMonths,
  addWeeks,
  addDays,
  dateToParam,
  paramToDate,
} from '@/lib/calendar-utils';
import type { CalendarViewType } from '@/lib/types';

export function useCalendar() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const view = (searchParams.get('view') as CalendarViewType) || 'month';

  const dateParam = searchParams.get('date');
  const currentDate = useMemo(() => {
    if (dateParam) return paramToDate(dateParam);
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [dateParam]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const periodLabel = useMemo(() => {
    switch (view) {
      case 'month':
        return formatMonthYear(currentDate);
      case 'week':
        return formatWeekRange(getWeekStart(currentDate));
      case 'day':
        return formatDayFull(currentDate);
    }
  }, [view, currentDate]);

  const subtitle = useMemo(() => {
    switch (view) {
      case 'month':
        return 'Visualiza tus tareas en el calendario';
      case 'week':
        return formatWeekRange(getWeekStart(currentDate));
      case 'day':
        return formatDayFull(currentDate);
    }
  }, [view, currentDate]);

  const visibleRange = useMemo(() => {
    switch (view) {
      case 'month':
        return getMonthDateRange(currentDate.getFullYear(), currentDate.getMonth());
      case 'week':
        return getWeekDateRange(currentDate);
      case 'day':
        return getDayDateRange(currentDate);
    }
  }, [view, currentDate]);

  const navigate = useCallback(
    (newView: CalendarViewType, newDate: Date) => {
      const params = new URLSearchParams();
      params.set('view', newView);
      params.set('date', dateToParam(newDate, newView));
      router.push(`/calendar?${params.toString()}`);
    },
    [router]
  );

  const goToNext = useCallback(() => {
    switch (view) {
      case 'month': navigate(view, addMonths(currentDate, 1)); break;
      case 'week':  navigate(view, addWeeks(currentDate, 1));  break;
      case 'day':   navigate(view, addDays(currentDate, 1));   break;
    }
  }, [view, currentDate, navigate]);

  const goToPrev = useCallback(() => {
    switch (view) {
      case 'month': navigate(view, addMonths(currentDate, -1)); break;
      case 'week':  navigate(view, addWeeks(currentDate, -1));  break;
      case 'day':   navigate(view, addDays(currentDate, -1));   break;
    }
  }, [view, currentDate, navigate]);

  const goToToday = useCallback(() => {
    navigate(view, new Date());
  }, [view, navigate]);

  const setView = useCallback(
    (newView: CalendarViewType) => {
      navigate(newView, currentDate);
    },
    [currentDate, navigate]
  );

  const goToDate = useCallback(
    (date: Date) => {
      navigate(view, date);
    },
    [view, navigate]
  );

  return useMemo(
    () => ({
      view,
      currentDate,
      today,
      periodLabel,
      subtitle,
      visibleRange,
      goToNext,
      goToPrev,
      goToToday,
      setView,
      goToDate,
    }),
    [view, currentDate, today, periodLabel, subtitle, visibleRange, goToNext, goToPrev, goToToday, setView, goToDate]
  );
}
