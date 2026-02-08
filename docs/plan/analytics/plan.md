# Plan: Dashboard Analytics

## Context

Task-It necesita una vista de Dashboard Analytics que muestre metricas de productividad derivadas de los datos existentes en localStorage (tareas, tags, pomodoro). El diseno esta en `docs/design/task-it.pen` frame "Dashboard Analytics V3". Actualmente el NavItem "Dashboard" apunta a `/` (misma ruta que "Mis Tareas") y no tiene funcionalidad propia.

**Objetivo:** Implementar la ruta `/analytics` con KPIs, grafico de actividad semanal, distribucion por etiquetas y actividad reciente. Todo computado desde datos existentes, sin backend.

## Referencia del diseno

El frame muestra: Sidebar (260px) + Main Content con:
- **Header**: "Dashboard" + subtitulo + selector de rango de fechas + boton exportar
- **4 KPI Cards**: Tareas Completadas (24), Tasa de Completado (85%), Tiempo de Focus (12.5h), Racha Actual (7 dias) — cada una con icono y badge de tendencia
- **Grafico de Actividad Semanal**: 7 columnas (Lun-Dom) con barras dobles (completadas=violet, pendientes=gris)
- **Seccion inferior**: Distribucion por Etiquetas (donut chart + lista) | Actividad Reciente (5 items)

## Archivos a crear/modificar

```
MODIFICAR:
  lib/types.ts                          # Tipos analytics
  lib/constants.ts                      # Constantes + STORAGE_KEYS
  components/layout/Sidebar.tsx         # Navegacion /analytics

CREAR:
  lib/analytics-utils.ts                # Funciones puras de calculo
  hooks/useAnalytics.ts                 # Hook principal
  components/analytics/AnalyticsView.tsx
  components/analytics/AnalyticsHeader.tsx
  components/analytics/KpiCard.tsx
  components/analytics/KpiCardsRow.tsx
  components/analytics/WeeklyActivityChart.tsx
  components/analytics/TagDistribution.tsx
  components/analytics/RecentActivity.tsx
  components/analytics/index.ts
  app/analytics/page.tsx
```

## Orden de implementacion

### Paso 1 — Fundamentos (paralelo)

**1a. Tipos** (`lib/types.ts`): Agregar al final del archivo:

```typescript
// Analytics
export type AnalyticsDateRange = 'this_week' | 'last_7_days' | 'this_month' | 'last_30_days';

export interface KpiData {
  completedCount: number;
  completionRate: number;       // 0-100
  focusTimeHours: number;
  currentStreak: number;        // dias consecutivos
}

export interface KpiTrend {
  value: number;
  isPositive: boolean;
}

export interface DailyActivity {
  date: string;                 // YYYY-MM-DD
  dayLabel: string;             // "Lun", "Mar", etc.
  completed: number;
  pending: number;
}

export interface TagCount {
  tagId: string;
  tagName: string;
  tagColor: TagColor;
  count: number;
}

export type ActivityActionType = 'completed' | 'created' | 'pomodoro';

export interface ActivityItem {
  id: string;
  action: ActivityActionType;
  title: string;
  meta: string;
  timestamp: string;
}

export interface AnalyticsData {
  kpis: KpiData;
  kpiTrends: Record<keyof KpiData, KpiTrend>;
  weeklyActivity: DailyActivity[];
  tagDistribution: TagCount[];
  recentActivity: ActivityItem[];
  totalTasksInRange: number;
}
```

**1b. Constantes** (`lib/constants.ts`): Agregar `ANALYTICS_DATE_RANGE: 'task-it-analytics-date-range'` a `STORAGE_KEYS` y:

```typescript
export const ANALYTICS_DATE_RANGES: { value: AnalyticsDateRange; label: string }[] = [
  { value: 'this_week', label: 'Esta semana' },
  { value: 'last_7_days', label: 'Ultimos 7 dias' },
  { value: 'this_month', label: 'Este mes' },
  { value: 'last_30_days', label: 'Ultimos 30 dias' },
];

export const ANALYTICS_DEFAULTS = {
  DATE_RANGE: 'this_week' as AnalyticsDateRange,
  MAX_RECENT_ACTIVITIES: 5,
} as const;
```

**1c. Navegacion** (`components/layout/Sidebar.tsx`): Solo cambiar los NavItems:
- Dashboard: `href="/analytics"`, `active={currentPath === '/analytics'}`
- Mis Tareas: `href="/"`, `active={currentPath === '/'}`

(No se necesitan cambios en NavItem.tsx — el icono `layout-dashboard` ya existe)

**1d. Ruta skeleton** (`app/analytics/page.tsx`): Crear pagina con `AppShell` + skeleton de loading.

---

### Paso 2 — Logica de calculo

**`lib/analytics-utils.ts`** — Funciones puras (sin hooks, sin side-effects):

| Funcion | Descripcion |
|---------|-------------|
| `getDateRange(range)` | Retorna `{ start, end }` para el rango seleccionado |
| `getPreviousDateRange(range)` | Periodo anterior de misma duracion (para tendencias) |
| `filterTasksByDateRange(tasks, start, end)` | Filtra tareas por `updatedAt` dentro del rango |
| `computeKpis(tasksInRange, allTasks, focusMinutes)` | Calcula los 4 KPIs |
| `computeStreak(allTasks)` | Dias consecutivos con >= 1 tarea completada |
| `computeKpiTrends(current, previous)` | Diferencia entre periodo actual y anterior |
| `computeWeeklyActivity(tasks, weekStart)` | 7 entradas Lun-Dom con barras completed/pending. Reutiliza `WEEKDAY_LABELS` de constants.ts |
| `computeTagDistribution(tasks, tags)` | Conteo de tareas por tag, ordenado desc |
| `computeRecentActivity(tasks, maxItems)` | Ultimas 5 actividades (completar, crear) con tiempo relativo |
| `formatRelativeTime(isoString)` | "Hace 2h", "Hace 1 dia", etc. |
| `computePomodoroFocusMinutes(state)` | Suma minutos de focus del estado Pomodoro |

**Logica de streak**: A partir de hoy, contar hacia atras dias consecutivos con al menos 1 tarea completada (por `updatedAt`). Si hoy no tiene, empezar desde ayer.

**Logica de weekly chart**: Completadas = tareas con `status === 'completed'` cuyo `updatedAt` cae en ese dia. Pendientes = tareas con `status !== 'completed'` cuyo `createdAt` cae en ese dia.

---

### Paso 3 — Hook principal

**`hooks/useAnalytics.ts`**: Compone `useTasks()`, `useTags()`, lee `POMODORO_STATE` de localStorage (solo lectura), y expone:

```typescript
{
  data: AnalyticsData,    // Todo computado y memoizado
  dateRange: AnalyticsDateRange,
  setDateRange: (range: AnalyticsDateRange) => void,
}
```

Todo el calculo dentro de un `useMemo` con deps `[tasks, tags, dateRange, pomodoroState]`.

---

### Paso 4 — Componentes UI (paralelo)

**4a. `AnalyticsHeader.tsx`**
- Reutiliza `PageHeader` con `title="Dashboard"`, `subtitle="Resumen de tu productividad y progreso"`, `showSearch={false}`
- En el slot `actions`: pill de date range (dropdown simple con useState) + boton "Exportar" (disabled para MVP)

**4b. `KpiCard.tsx` + `KpiCardsRow.tsx`**
- `KpiCard`: bg-secondary, rounded-[24px], p-6. Icono 40x40 con bg color/20. Valor grande (32px bold). Badge de tendencia con TrendingUp/TrendingDown.
- `KpiCardsRow`: Grid 2 cols mobile, 4 cols desktop. Mapea los 4 KPIs:
  1. Completadas: CircleCheck, violet
  2. Tasa: Target, green
  3. Focus: Brain, amber
  4. Racha: Flame, red

**4c. `WeeklyActivityChart.tsx`** — Grafico de barras CSS puro (sin libreria)
- 7 columnas flex con barras de altura proporcional al max valor
- Barra completadas: bg-primary, rounded-t-[8px], w-7
- Barra pendientes: bg-border, rounded-t-[8px], w-7
- Leyenda: dots + labels

**4d. `TagDistribution.tsx`** — Donut SVG + lista de tags
- SVG donut con `stroke-dasharray`/`stroke-dashoffset` para segmentos
- Centro: numero total
- Lista: dot de color + nombre + count + barra de progreso

**4e. `RecentActivity.tsx`** — Lista de 5 items
- Icono por tipo: completed=CircleCheck(green), created=CirclePlus(violet), pomodoro=Timer(amber)
- Titulo + meta con tiempo relativo

---

### Paso 5 — Integracion

**`AnalyticsView.tsx`**: Orquestador que usa `useAnalytics()` y pasa props a cada sub-componente.

**`app/analytics/page.tsx`**: Conectar `AnalyticsView` dentro de `AppShell` con `Suspense` + skeleton.

**`components/analytics/index.ts`**: Barrel export.

---

## Reutilizacion de codigo existente

| Recurso existente | Donde se usa |
|---|---|
| `PageHeader` (`components/layout/PageHeader.tsx`) | AnalyticsHeader — con `showSearch={false}` y `actions` |
| `WEEKDAY_LABELS` (`lib/constants.ts:95`) | WeeklyActivityChart — labels de dias |
| `useTasks()` (`hooks/useTasks.ts`) | useAnalytics — fuente de datos |
| `useTags()` (`hooks/useTags.ts`) | useAnalytics — nombres y colores de tags |
| `useLocalStorage()` (`hooks/useLocalStorage.ts`) | useAnalytics — leer PomodoroState + persistir dateRange |
| `cn()` (`lib/utils.ts`) | Todos los componentes — merge de clases |
| `AppShell` (`components/layout/AppShell.tsx`) | analytics/page.tsx — layout wrapper |
| `Button` (`components/ui/Button.tsx`) | AnalyticsHeader — boton exportar |

## Decisiones de diseno

1. **Sin libreria de graficos** — Barras con CSS/Tailwind, donut con SVG inline. Zero bundle impact, control total del diseno.
2. **Export diferido** — Boton visible pero disabled (MVP). Se implementa en iteracion futura.
3. **Focus time limitado** — Lee solo el PomodoroState actual de localStorage. Sin historial de sesiones (limitacion conocida del MVP).
4. **Tendencias** — Comparan periodo actual vs periodo anterior de misma duracion.
5. **Todo computado on-the-fly** — Sin cache ni storage adicional. Con cantidades tipicas (<100 tareas), es instantaneo.
6. **Dark mode** — Solo variables CSS via Tailwind (`bg-secondary`, `text-foreground`, etc.). Para colores de tags/badges: `bg-{color}-500/20 text-{color}-600 dark:text-{color}-400`.

## Verificacion

1. `npm run build` — Verificar que compila sin errores
2. `npm run lint` — Sin warnings/errors
3. Navegar a `/analytics` — Verificar que carga correctamente
4. Verificar con tareas existentes que los KPIs, grafico y distribucion muestran datos reales
5. Cambiar rango de fechas — Verificar que los datos se actualizan
6. Toggle dark mode — Verificar que todos los colores responden correctamente
7. Responsive: verificar en mobile (KPIs 2 cols, bottom section stacked)
8. Empty state: sin tareas, verificar que muestra zeros sin errores
9. Verificar que la navegacion "Dashboard" marca active en `/analytics` y "Mis Tareas" marca active en `/`
