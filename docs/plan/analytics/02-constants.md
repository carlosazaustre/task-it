# Spec 02: Constantes Analytics

**Archivo:** `lib/constants.ts`
**Acción:** Modificar (añadir al final + modificar STORAGE_KEYS)
**Dependencias:** 01-types
**Bloquea:** 05-analytics-utils, 06-hook

---

## Cambios en STORAGE_KEYS

Agregar nueva key al objeto existente:

```typescript
export const STORAGE_KEYS = {
  TASKS: 'task-it-tasks',
  TAGS: 'task-it-tags',
  POMODORO_CONFIG: 'task-it-pomodoro-config',
  POMODORO_STATE: 'task-it-pomodoro-state',
  ANALYTICS_DATE_RANGE: 'task-it-analytics-date-range',  // NUEVO
} as const;
```

## Constantes nuevas a añadir

```typescript
import type { AnalyticsDateRange } from './types';

// Opciones del selector de rango de fechas
export const ANALYTICS_DATE_RANGES: { value: AnalyticsDateRange; label: string }[] = [
  { value: 'this_week', label: 'Esta semana' },
  { value: 'last_7_days', label: 'Últimos 7 días' },
  { value: 'this_month', label: 'Este mes' },
  { value: 'last_30_days', label: 'Últimos 30 días' },
];

// Valores por defecto
export const ANALYTICS_DEFAULTS = {
  DATE_RANGE: 'this_week' as AnalyticsDateRange,
  MAX_RECENT_ACTIVITIES: 5,
} as const;
```

## Reutilización

- `WEEKDAY_LABELS` (línea 95) ya existe — se reutiliza en `computeWeeklyActivity()`
- No se necesitan más constantes para el MVP

## Verificación

- `npm run build` compila sin errores
- Las constantes son importables desde `@/lib/constants`
- `STORAGE_KEYS.ANALYTICS_DATE_RANGE` disponible
