# 04 - Hook useCalendar

## Archivo

`hooks/useCalendar.ts`

## Propósito

Gestionar el estado de navegación del calendario: vista activa, fecha de referencia, y rango visible. El estado se persiste en URL search params para permitir deep linking y navegación del browser.

## Interface

```typescript
interface UseCalendarReturn {
  // Estado
  view: CalendarViewType;
  currentDate: Date;
  today: Date;

  // Derivados
  periodLabel: string;
  subtitle: string;
  visibleRange: { start: Date; end: Date };

  // Navegación
  goToNext: () => void;
  goToPrev: () => void;
  goToToday: () => void;
  setView: (view: CalendarViewType) => void;
  goToDate: (date: Date) => void;
}
```

## Dependencias

```typescript
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import {
  formatMonthYear,
  formatWeekRange,
  formatDayFull,
  getMonthDateRange,
  getWeekDateRange,
  getDayDateRange,
  addMonths,
  addWeeks,
  addDays,
  dateToParam,
  paramToDate,
} from '@/lib/calendar-utils';
import type { CalendarViewType } from '@/lib/types';
```

## Lectura del estado

```typescript
const searchParams = useSearchParams();
const router = useRouter();

// Leer vista (default: 'month')
const view = (searchParams.get('view') as CalendarViewType) || 'month';

// Leer fecha (default: hoy)
const dateParam = searchParams.get('date');
const currentDate = dateParam ? paramToDate(dateParam) : new Date();

// Hoy (memoizado)
const today = useMemo(() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}, []);
```

## Valores derivados

### `periodLabel`

Texto entre las flechas de navegación:

```typescript
const periodLabel = useMemo(() => {
  switch (view) {
    case 'month': return formatMonthYear(currentDate);       // "Febrero 2025"
    case 'week':  return formatWeekRange(getWeekStart(currentDate)); // "Semana del 3 al 9 de Febrero"
    case 'day':   return formatDayFull(currentDate);         // "Jueves, 6 de Febrero"
  }
}, [view, currentDate]);
```

### `subtitle`

Texto debajo del título "Calendario":

```typescript
const subtitle = useMemo(() => {
  switch (view) {
    case 'month': return 'Visualiza tus tareas en el calendario';
    case 'week':  return formatWeekRange(getWeekStart(currentDate));
    case 'day': {
      // Se calcula dinámicamente con el número de tareas
      // El componente CalendarView lo override con el conteo real
      return formatDayFull(currentDate);
    }
  }
}, [view, currentDate]);
```

### `visibleRange`

Rango de fechas visibles para filtrar tareas:

```typescript
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
```

## Funciones de navegación

Todas actualizan URL search params via `router.push()`:

```typescript
const navigate = useCallback((newView: CalendarViewType, newDate: Date) => {
  const params = new URLSearchParams();
  params.set('view', newView);
  params.set('date', dateToParam(newDate, newView));
  router.push(`/calendar?${params.toString()}`);
}, [router]);

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

const setView = useCallback((newView: CalendarViewType) => {
  navigate(newView, currentDate);
}, [currentDate, navigate]);

const goToDate = useCallback((date: Date) => {
  navigate(view, date);
}, [view, navigate]);
```

## Patrón de retorno

Sigue el mismo patrón `useMemo` que `useTasks` y `useTags`:

```typescript
return useMemo(() => ({
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
}), [view, currentDate, today, periodLabel, subtitle, visibleRange,
     goToNext, goToPrev, goToToday, setView, goToDate]);
```

## Flujo de datos completo

```
URL search params (?view=month&date=2025-02)
        │
        ▼
   useCalendar()
   ├── view: 'month'
   ├── currentDate: Date(2025, 1, 1)
   ├── visibleRange: { start: 27 Ene, end: 2 Mar }
   │
   ▼
CalendarView
   ├── useTasks() → tasks[]
   ├── useTags() → tags[]
   ├── getTasksInRange(tasks, visibleRange.start, visibleRange.end)
   │
   ▼
MonthView / WeekView / DayView
   └── Renderiza tareas filtradas en sus posiciones
```

## Consideración: `useSearchParams` y Suspense

En Next.js 16, `useSearchParams()` requiere un boundary `<Suspense>`. El componente `CalendarView` o `app/calendar/page.tsx` debe wrappear con Suspense:

```tsx
// app/calendar/page.tsx
import { Suspense } from 'react';

export default function CalendarPage() {
  return (
    <AppShell>
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarView />
      </Suspense>
    </AppShell>
  );
}
```
