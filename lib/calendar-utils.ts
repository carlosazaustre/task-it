import { isSameDay } from './utils';
import type { CalendarViewType } from './types';
import type { Task } from './types';

// ── Grid generation ──────────────────────────────────────────────

export function getMonthGrid(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  // Adjust so Monday = 0 (JS getDay: 0=Sun)
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const start = new Date(year, month, 1 - offset);
  const rows: Date[][] = [];

  for (let week = 0; week < 6; week++) {
    const row: Date[] = [];
    for (let day = 0; day < 7; day++) {
      const d = new Date(start);
      d.setDate(start.getDate() + week * 7 + day);
      row.push(d);
    }
    rows.push(row);

    // Stop at 5 rows if the next row's first day is in a future month
    if (week >= 4) {
      const nextRowStart = new Date(start);
      nextRowStart.setDate(start.getDate() + (week + 1) * 7);
      if (nextRowStart.getMonth() !== month && nextRowStart.getDate() > 7) {
        break;
      }
    }
  }

  return rows;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDates(date: Date): Date[] {
  const monday = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function getDayHours(startHour = 8, endHour = 18): number[] {
  return Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
}

// ── Date ranges ──────────────────────────────────────────────────

export function getMonthDateRange(year: number, month: number): { start: Date; end: Date } {
  const grid = getMonthGrid(year, month);
  const start = new Date(grid[0][0]);
  start.setHours(0, 0, 0, 0);
  const lastRow = grid[grid.length - 1];
  const end = new Date(lastRow[6]);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function getWeekDateRange(date: Date): { start: Date; end: Date } {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function getDayDateRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// ── Navigation ───────────────────────────────────────────────────

export function addMonths(date: Date, count: number): Date {
  const d = new Date(date);
  const targetMonth = d.getMonth() + count;
  d.setMonth(targetMonth);
  // Handle overflow (e.g. Jan 31 + 1 month = Feb 28)
  if (d.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    d.setDate(0); // Go to last day of previous month
  }
  return d;
}

export function addWeeks(date: Date, count: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + count * 7);
  return d;
}

export function addDays(date: Date, count: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + count);
  return d;
}

// ── Formatting (Spanish) ─────────────────────────────────────────

export function formatMonthYear(date: Date): string {
  const formatted = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(weekEnd);
  const capitalMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `Semana del ${startDay} al ${endDay} de ${capitalMonth}`;
  }

  const startMonth = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(weekStart);
  const capitalStartMonth = startMonth.charAt(0).toUpperCase() + startMonth.slice(1);
  return `Semana del ${startDay} de ${capitalStartMonth} al ${endDay} de ${capitalMonth}`;
}

export function formatDayFull(date: Date): string {
  const formatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ── Comparison ───────────────────────────────────────────────────

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

// ── Task filtering ───────────────────────────────────────────────

export function getTasksForDate(tasks: Task[], date: Date): Task[] {
  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    return isSameDay(new Date(task.dueDate), date);
  });
}

export function getTasksInRange(tasks: Task[], start: Date, end: Date): Task[] {
  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    const d = new Date(task.dueDate);
    return d >= start && d <= end;
  });
}

export function groupTasksByDate(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const key = task.dueDate.slice(0, 10);
    const existing = map.get(key) || [];
    existing.push(task);
    map.set(key, existing);
  }
  return map;
}

export function dateToKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ── URL param helpers ────────────────────────────────────────────

export function dateToParam(date: Date, view: CalendarViewType): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');

  if (view === 'month') {
    return `${y}-${m}`;
  }

  if (view === 'week') {
    const monday = getWeekStart(date);
    const wy = monday.getFullYear();
    const wm = String(monday.getMonth() + 1).padStart(2, '0');
    const wd = String(monday.getDate()).padStart(2, '0');
    return `${wy}-${wm}-${wd}`;
  }

  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function paramToDate(param: string): Date {
  const parts = param.split('-').map(Number);
  if (parts.length === 2) {
    return new Date(parts[0], parts[1] - 1, 1);
  }
  return new Date(parts[0], parts[1] - 1, parts[2]);
}
