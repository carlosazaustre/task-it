# Spec 04: Ruta Skeleton

**Archivo:** `app/analytics/page.tsx`
**Acción:** Crear
**Dependencias:** Ninguna
**Bloquea:** 12-orchestrator (se actualiza al final)

---

## Estructura inicial

Sigue el patrón existente de `app/pomodoro/page.tsx`:

```tsx
'use client';

import { AppShell } from '@/components/layout/AppShell';

function AnalyticsSkeleton() {
  return (
    <div className="animate-pulse space-y-7">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-10 bg-secondary rounded-[14px] w-52" />
        <div className="h-5 bg-secondary rounded-[14px] w-80" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[130px] bg-secondary rounded-[24px]" />
        ))}
      </div>

      {/* Weekly chart skeleton */}
      <div className="h-[280px] bg-secondary rounded-[24px]" />

      {/* Bottom row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[300px] bg-secondary rounded-[24px]" />
        <div className="h-[300px] bg-secondary rounded-[24px]" />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AppShell>
      {/* Placeholder — se reemplaza en spec 12 */}
      <AnalyticsSkeleton />
    </AppShell>
  );
}
```

## Notas

- `AnalyticsSkeleton` se mantiene como componente interno para reutilizar como fallback de Suspense
- En spec 12 se reemplaza `<AnalyticsSkeleton />` por `<AnalyticsView />`
- Los skeleton shapes coinciden con el layout del diseño: header, 4 KPIs, chart, 2 bottom panels

## Verificación

- Navegar a `http://localhost:3000/analytics` muestra el skeleton animado
- El layout AppShell (sidebar + main content) se renderiza correctamente
- `npm run build` compila sin errores
