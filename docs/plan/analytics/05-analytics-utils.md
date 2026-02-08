# Spec 05: Utilidades Analytics

**Archivo:** `lib/analytics-utils.ts`
**Acción:** Crear
**Dependencias:** 01-types, 02-constants
**Bloquea:** 06-hook

---

## Funciones puras (sin hooks, sin side-effects)

### `getDateRange(range: AnalyticsDateRange): { start: Date; end: Date }`

Retorna fechas inclusivas para cada rango:

- `'this_week'`: Lunes 00:00 → Domingo 23:59:59 de la semana actual
- `'last_7_days'`: 6 días atrás 00:00 → Hoy 23:59:59
- `'this_month'`: Día 1 del mes 00:00 → Último día 23:59:59
- `'last_30_days'`: 29 días atrás 00:00 → Hoy 23:59:59

Lógica para `this_week`:
```typescript
const now = new Date();
const day = now.getDay(); // 0=Dom, 1=Lun...
const monday = new Date(now);
monday.setDate(now.getDate() - ((day + 6) % 7));
monday.setHours(0, 0, 0, 0);
const sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6);
sunday.setHours(23, 59, 59, 999);
```

---

### `getPreviousDateRange(range: AnalyticsDateRange): { start: Date; end: Date }`

Periodo anterior de misma duración (para comparar tendencias):
- `'this_week'` → Lunes-Domingo de la semana pasada
- `'last_7_days'` → 14 a 8 días atrás
- `'this_month'` → Mes anterior completo
- `'last_30_days'` → 60 a 31 días atrás

---

### `filterTasksByDateRange(tasks: Task[], start: Date, end: Date): Task[]`

Filtra tareas cuyo `updatedAt` cae dentro de `[start, end]`.

---

### `computeKpis(tasksInRange: Task[], allTasks: Task[], focusMinutes: number): KpiData`

- `completedCount`: tareas con `status === 'completed'` en el rango
- `completionRate`: `(completed / total) * 100`. Si total = 0, rate = 0
- `focusTimeHours`: `focusMinutes / 60`, redondeado a 1 decimal
- `currentStreak`: delega a `computeStreak(allTasks)` (siempre sobre todas las tareas)

---

### `computeStreak(tasks: Task[]): number`

Algoritmo:
1. Extraer fechas únicas (solo parte date) de tareas con `status === 'completed'` usando `updatedAt`
2. Crear Set de strings `"YYYY-M-D"` para lookup rápido
3. Empezar desde hoy. Si hoy no tiene completadas, probar ayer. Si tampoco, return 0
4. Contar hacia atrás días consecutivos presentes en el Set

```typescript
function computeStreak(tasks: Task[]): number {
  const completedDates = new Set<string>();
  for (const task of tasks) {
    if (task.status === 'completed') {
      const d = new Date(task.updatedAt);
      completedDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(today);
  const todayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;

  if (!completedDates.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (!completedDates.has(yesterdayKey)) return 0;
  }

  let streak = 0;
  while (true) {
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (completedDates.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
```

---

### `computeKpiTrends(current: KpiData, previous: KpiData): Record<keyof KpiData, KpiTrend>`

Para cada campo de KpiData:
- `value = current[field] - previous[field]` (redondeado)
- `isPositive = value >= 0`

---

### `computeWeeklyActivity(tasks: Task[], weekStart: Date): DailyActivity[]`

1. Crear 7 entradas para Lun-Dom usando `WEEKDAY_LABELS` de constants.ts
2. Para cada tarea:
   - Si `status === 'completed'` y `updatedAt` cae en un día de la semana → incrementar `completed` de ese día
   - Si `status !== 'completed'` y `createdAt` cae en un día de la semana → incrementar `pending` de ese día
3. Retornar array de 7 `DailyActivity`

---

### `computeTagDistribution(tasks: Task[], tags: Tag[]): TagCount[]`

1. Crear mapa `tagId → count` iterando `task.tags` de todas las tareas en rango
2. Mapear a `TagCount[]` usando info de tags (nombre, color)
3. Ordenar por count descendente
4. Filtrar tags con count = 0

---

### `computeRecentActivity(tasks: Task[], maxItems: number): ActivityItem[]`

1. Para cada tarea, generar entries:
   - Si `status === 'completed'`: `{ action: 'completed', timestamp: updatedAt, meta: "Completada · {relativeTime}" }`
   - Siempre: `{ action: 'created', timestamp: createdAt, meta: "Creada · {relativeTime}" }`
2. Ordenar por timestamp descendente
3. Tomar primeros `maxItems` (default 5)

---

### `formatRelativeTime(isoString: string): string`

- < 1 min: `"Hace un momento"`
- < 60 min: `"Hace Xm"`
- < 24h: `"Hace Xh"`
- < 48h: `"Ayer"`
- < 7d: `"Hace X días"`
- Else: `"Hace X semanas"`

---

### `computePomodoroFocusMinutes(pomodoroState: PomodoroState | null): number`

- Si `null` o `phase === 'setup'`: return 0
- Suma `durationMinutes` de sessions de tipo `'focus'` hasta `currentSessionIndex`

---

## Verificación

- Todas las funciones son puras (sin efectos secundarios)
- `npm run build` compila sin errores
- Se pueden testear unitariamente con datos mock
