# Spec 03: Navegacion - Enlace a Settings

**Archivo:** `components/layout/Sidebar.tsx`
**Accion:** Modificar (anadir href al NavItem de Ajustes)
**Dependencias:** Ninguna especifica de settings
**Bloquea:** 12-orchestrator (se necesita para navegar)

---

## Cambio requerido

El `NavItem` de "Ajustes" actualmente no tiene `href`. Anadir `/settings`:

### Antes

```tsx
<NavItem
  icon="settings"
  label="Ajustes"
  active={currentPath === '/settings'}
/>
```

### Despues

```tsx
<NavItem
  icon="settings"
  label="Ajustes"
  href="/settings"
  active={currentPath === '/settings'}
/>
```

## Verificacion

- El enlace "Ajustes" en la sidebar navega a `/settings`
- El estado `active` se activa correctamente al estar en `/settings`
