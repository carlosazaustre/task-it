# Spec 04: Navegación Sidebar

**Archivos:** `components/layout/NavItem.tsx`, `components/layout/Sidebar.tsx`
**Acción:** Modificar ambos
**Dependencias:** Ninguna (no depende de tipos Pomodoro)
**Bloquea:** Nada (independiente)
**Paralelizable con:** `02-constants`, `03-utils`, `05-route-skeleton`

---

## Cambios en NavItem.tsx

Añadir el icono `Timer` de lucide-react al mapa de iconos.

1. Importar `Timer` desde `lucide-react`
2. Añadir `'timer'` al tipo `IconName` (o al union type que use)
3. Añadir entrada en el objeto `ICONS`: `'timer': Timer`

## Cambios en Sidebar.tsx

Añadir NavItem de Pomodoro entre "Calendario" y "Ajustes":

```tsx
<NavItem
  icon="timer"
  label="Pomodoro"
  href="/pomodoro"
  active={currentPath === '/pomodoro'}
/>
```

**Posición:** Después de `Calendario` (`/calendar`) y antes de `Ajustes` (`/settings`).

## Verificación

- El sidebar muestra 5 items: Dashboard, Mis Tareas, Calendario, **Pomodoro**, Ajustes
- Al navegar a `/pomodoro`, el item se marca como activo (fondo violet)
- El icono Timer se renderiza correctamente
- Dark mode funciona
