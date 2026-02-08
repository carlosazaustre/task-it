# Spec 03: Actualización de Navegación

**Archivo:** `components/layout/Sidebar.tsx`
**Acción:** Modificar (cambiar hrefs y active checks)
**Dependencias:** Ninguna (independiente de tipos analytics)
**Bloquea:** Nada (pero mejora la experiencia de navegación)

---

## Problema actual

En `Sidebar.tsx` (líneas 71-82), "Dashboard" y "Mis Tareas" están mal configurados:

```tsx
// ACTUAL — ambos apuntan a "/" y "Mis Tareas" nunca se activa
<NavItem icon="layout-dashboard" label="Dashboard" href="/" active={currentPath === '/'} />
<NavItem icon="list-todo" label="Mis Tareas" href="/" active={currentPath === '/tasks'} />
```

## Cambio requerido

```tsx
// NUEVO — Dashboard apunta a /analytics, Mis Tareas se activa en /
<NavItem
  icon="layout-dashboard"
  label="Dashboard"
  href="/analytics"
  active={currentPath === '/analytics'}
/>
<NavItem
  icon="list-todo"
  label="Mis Tareas"
  href="/"
  active={currentPath === '/'}
/>
```

## Sin cambios en NavItem.tsx

El icono `layout-dashboard` ya existe en el mapa `ICONS` de `NavItem.tsx`. No se requiere ninguna modificación.

## Verificación

- Navegar a `/analytics` → Dashboard se marca como activo
- Navegar a `/` → Mis Tareas se marca como activo
- Los demás NavItems (Calendario, Pomodoro, Ajustes) no cambian
