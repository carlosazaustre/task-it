# Spec 12: Orquestador AnalyticsView

**Archivos:**
- `components/analytics/AnalyticsView.tsx` — Crear
- `components/analytics/index.ts` — Crear (barrel export)
- `app/analytics/page.tsx` — Modificar (conectar componente real)

**Acción:** Crear + Modificar
**Dependencias:** 07-header, 08-kpi-cards, 09-weekly-chart, 10-tag-distribution, 11-recent-activity
**Bloquea:** Nada (es el último paso)

---

## AnalyticsView.tsx

Componente orquestador que conecta el hook con todos los sub-componentes:

```tsx
'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsHeader } from './AnalyticsHeader';
import { KpiCardsRow } from './KpiCardsRow';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { TagDistribution } from './TagDistribution';
import { RecentActivity } from './RecentActivity';

export function AnalyticsView() {
  const { data, dateRange, setDateRange } = useAnalytics();

  return (
    <div className="flex flex-col gap-7">
      <AnalyticsHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <KpiCardsRow
        kpis={data.kpis}
        trends={data.kpiTrends}
      />

      <WeeklyActivityChart data={data.weeklyActivity} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TagDistribution
          data={data.tagDistribution}
          totalTasks={data.totalTasksInRange}
        />
        <RecentActivity activities={data.recentActivity} />
      </div>
    </div>
  );
}
```

## index.ts (barrel export)

```typescript
export { AnalyticsView } from './AnalyticsView';
```

## Actualizar app/analytics/page.tsx

Reemplazar el skeleton placeholder por el componente real:

```tsx
'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AnalyticsView } from '@/components/analytics';

export default function AnalyticsPage() {
  return (
    <AppShell>
      <AnalyticsView />
    </AppShell>
  );
}
```

## Layout del diseño

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  [AnalyticsHeader]                               │
│                                                  │
│  [KpiCardsRow ─── 4 cards ─────────────────]     │
│                                                  │
│  [WeeklyActivityChart ─────────────────────]     │
│                                                  │
│  [TagDistribution] [RecentActivity]              │
│                                                  │
└──────────────────────────────────────────────────┘
```

- Gap vertical entre secciones: `gap-7` (28px) — coincide con diseño padding 28
- Bottom section: `grid grid-cols-1 lg:grid-cols-2 gap-4`

## Verificación final (end-to-end)

1. `npm run build` — Compila sin errores
2. `npm run lint` — Sin warnings/errors
3. Navegar a `/analytics` — Dashboard carga correctamente
4. Con tareas existentes: KPIs, gráfico y distribución muestran datos reales
5. Cambiar rango de fechas → datos se actualizan
6. Toggle dark mode → todos los colores responden
7. Responsive mobile → KPIs 2 cols, bottom section stacked
8. Empty state → sin tareas muestra zeros sin errores
9. Navegación "Dashboard" marca active en `/analytics`
10. Navegación "Mis Tareas" marca active en `/`
