# Spec 05: Ruta y Página Skeleton

**Archivo:** `app/pomodoro/page.tsx`
**Acción:** Crear
**Dependencias:** Ninguna (skeleton independiente)
**Bloquea:** `10-orchestrator` (la conectará con PomodoroView)
**Paralelizable con:** `02-constants`, `03-utils`, `04-navigation`

---

## Implementación

Sigue el patrón exacto de `app/calendar/page.tsx`:

```tsx
'use client';

import { Suspense } from 'react';
import { AppShell } from '@/components/layout';

function PomodoroSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4">
        <div className="h-10 bg-secondary rounded-[14px] w-48" />
        <div className="h-5 bg-secondary rounded-[14px] w-72" />
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-card rounded-[24px]" />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="h-[300px] bg-card rounded-[24px] flex-1" />
        <div className="h-[300px] bg-card rounded-[24px] w-full lg:w-[320px]" />
      </div>
    </div>
  );
}

export default function PomodoroPage() {
  return (
    <AppShell>
      <Suspense fallback={<PomodoroSkeleton />}>
        {/* PomodoroView se conectará en spec 10-orchestrator */}
        <PomodoroSkeleton />
      </Suspense>
    </AppShell>
  );
}
```

**Nota:** Inicialmente renderiza el skeleton. Se reemplazará por `<PomodoroView />` en la spec `10-orchestrator`.

## Verificación

- `npm run build` compila sin errores
- Navegar a `/pomodoro` muestra el skeleton con la estructura correcta
- AppShell con Sidebar se renderiza correctamente
- Responsive: stats en 2 cols mobile, 4 cols desktop
