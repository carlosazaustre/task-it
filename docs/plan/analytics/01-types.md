# Spec 01: Tipos Analytics

**Archivo:** `lib/types.ts`
**Acción:** Modificar (añadir al final)
**Dependencias:** Ninguna
**Bloquea:** 02-constants, 05-analytics-utils, 06-hook

---

## Tipos a añadir

```typescript
// === Analytics Types ===

// Rangos de fecha disponibles para el selector
export type AnalyticsDateRange = 'this_week' | 'last_7_days' | 'this_month' | 'last_30_days';

// Datos de los 4 KPI cards
export interface KpiData {
  completedCount: number;       // Tareas completadas en el rango
  completionRate: number;       // Porcentaje 0-100
  focusTimeHours: number;       // Horas de focus (desde Pomodoro)
  currentStreak: number;        // Días consecutivos con >= 1 completada
}

// Tendencia de un KPI (comparado con periodo anterior)
export interface KpiTrend {
  value: number;                // Diferencia numérica (ej: +12, -2)
  isPositive: boolean;          // true = mejora, false = empeora
}

// Actividad diaria para el gráfico semanal
export interface DailyActivity {
  date: string;                 // YYYY-MM-DD
  dayLabel: string;             // "Lun", "Mar", etc.
  completed: number;            // Tareas completadas ese día
  pending: number;              // Tareas creadas como pendientes ese día
}

// Conteo de tareas por tag para distribución
export interface TagCount {
  tagId: string;
  tagName: string;
  tagColor: TagColor;           // Reutiliza TagColor existente
  count: number;
}

// Tipos de acción en actividad reciente
export type ActivityActionType = 'completed' | 'created' | 'pomodoro';

// Item individual de actividad reciente
export interface ActivityItem {
  id: string;
  action: ActivityActionType;
  title: string;                // Título de la tarea
  meta: string;                 // "Completada · Hace 2h"
  timestamp: string;            // ISO 8601 para ordenar
}

// Datos completos del dashboard (retornados por useAnalytics)
export interface AnalyticsData {
  kpis: KpiData;
  kpiTrends: Record<keyof KpiData, KpiTrend>;
  weeklyActivity: DailyActivity[];
  tagDistribution: TagCount[];
  recentActivity: ActivityItem[];
  totalTasksInRange: number;
}
```

## Notas

- `TagColor` ya existe en el archivo — se reutiliza para `TagCount.tagColor`
- `PomodoroState` ya existe — se usa en el hook para leer focus time
- `AnalyticsData` es el tipo agregado que retorna el hook, facilitando destructuring en el view

## Verificación

- `npm run build` compila sin errores
- Los tipos son importables desde `@/lib/types`
