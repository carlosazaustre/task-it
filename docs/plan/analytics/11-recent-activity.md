# Spec 11: Actividad Reciente

**Archivo:** `components/analytics/RecentActivity.tsx`
**Acción:** Crear
**Dependencias:** 06-hook (recibe props del hook)
**Bloquea:** 12-orchestrator

---

## Props

```typescript
interface RecentActivityProps {
  activities: ActivityItem[];  // Max 5 items, ya ordenados
}
```

## Layout (del diseño)

```
┌────────────────────────────────────────────┐
│ Actividad Reciente                         │
│                                            │
│  [✓] Revisar propuesta de diseño           │
│      Completada · Hace 2h                  │
│                                            │
│  [✓] Preparar presentación Q1              │
│      Completada · Hace 4h                  │
│                                            │
│  [+] Llamar al cliente nuevo               │
│      Creada · Hace 5h                      │
│                                            │
│  [⏱] Sesión Pomodoro · 4 focus             │
│      Focus 1h 40m · Ayer                   │
│                                            │
│  [✓] Investigar nueva tecnología           │
│      Completada · Ayer                     │
└────────────────────────────────────────────┘
```

## Implementación

### Container
- `bg-secondary rounded-[24px] p-6 flex flex-col gap-4 flex-1`

### Título
- `text-lg font-bold font-heading text-foreground` → "Actividad Reciente"

### Activity List
- `flex flex-col gap-1`

### Activity Item
- Container: `flex items-center gap-3 bg-background rounded-[14px] px-3.5 py-3`

#### Icono por tipo de acción

| action | Icon | iconBgClass | iconColorClass |
|--------|------|-------------|----------------|
| `completed` | `CircleCheck` | `bg-green-500/20` | `text-green-500 dark:text-green-400` |
| `created` | `CirclePlus` | `bg-violet-500/20` | `text-violet-500 dark:text-violet-400` |
| `pomodoro` | `Timer` | `bg-amber-500/20` | `text-amber-500 dark:text-amber-400` |

- Icon wrap: `w-8 h-8 rounded-[10px] flex items-center justify-center {iconBgClass}`
- Icon: `w-4 h-4 {iconColorClass}`

#### Texto
- Container: `flex flex-col gap-0.5 flex-1 min-w-0`
- Title: `text-[13px] font-semibold text-foreground truncate`
- Meta: `text-[11px] text-muted-foreground`

### Empty state

Si `activities.length === 0`:
```tsx
<p className="text-sm text-muted-foreground text-center py-8">
  Sin actividad reciente
</p>
```

## Verificación

- 5 items se renderizan con íconos correctos por tipo
- Títulos se truncan con `...` si son muy largos
- Meta muestra tiempo relativo formateado
- Con 0 actividades: muestra empty state
- Dark mode: colores responden
- Responsive: ocupa el ancho completo
