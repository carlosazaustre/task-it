# Spec 06: Hook useAnalytics

**Archivo:** `hooks/useAnalytics.ts`
**Acción:** Crear
**Dependencias:** 01-types, 02-constants, 05-analytics-utils
**Bloquea:** 07-header, 08-kpi-cards, 09-weekly-chart, 10-tag-distribution, 11-recent-activity

---

## Interfaz del hook

```typescript
function useAnalytics(): {
  data: AnalyticsData;
  dateRange: AnalyticsDateRange;
  setDateRange: (range: AnalyticsDateRange) => void;
}
```

## Implementación

```typescript
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

  // Lee Pomodoro state (solo lectura, sin escribir)
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
```

## Hooks reutilizados

| Hook | Propósito |
|------|-----------|
| `useTasks()` | Fuente de datos de tareas |
| `useTags()` | Nombres y colores de tags |
| `useLocalStorage()` | Persistir preferencia dateRange + leer PomodoroState |

## Decisiones clave

- **Todo memoizado** con `useMemo` — solo recomputa cuando cambian tasks, tags, dateRange o pomodoroState
- **Streak siempre usa ALL tasks** (no filtradas por rango) porque es inherentemente "días consecutivos hasta hoy"
- **Weekly chart siempre usa semana actual** independientemente del dateRange seleccionado
- **Recent activity usa ALL tasks** (las más recientes sin filtrar por rango)
- **Focus time limitación MVP**: solo lee el PomodoroState actual, no historial

## Verificación

- `npm run build` compila sin errores
- El hook es importable desde `@/hooks/useAnalytics`
- Cambiar dateRange recalcula KPIs y tag distribution
- Con 0 tareas retorna todos los valores en 0 sin errores
