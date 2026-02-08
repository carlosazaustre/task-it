# Spec 04: Route Skeleton

**Archivo:** `app/settings/page.tsx` (NUEVO)
**Accion:** Crear
**Dependencias:** Ninguna especifica de settings
**Bloquea:** 12-orchestrator

---

## Archivo a crear

Sigue el mismo patron que `app/analytics/page.tsx`:

```tsx
'use client';

import { AppShell } from '@/components/layout/AppShell';
import { SettingsView } from '@/components/settings';

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsView />
    </AppShell>
  );
}
```

## Tambien crear barrel export

**Archivo:** `components/settings/index.ts` (NUEVO)

```typescript
export { SettingsView } from './SettingsView';
```

> Nota: `SettingsView` se creara en el spec 12-orchestrator. Por ahora el build fallara hasta que exista ese componente. Se puede crear un placeholder temporal:

**Archivo temporal:** `components/settings/SettingsView.tsx`

```tsx
export function SettingsView() {
  return <div>Settings - En construccion</div>;
}
```

## Verificacion

- La ruta `/settings` renderiza sin errores
- `npm run build` compila correctamente
