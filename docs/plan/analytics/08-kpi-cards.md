# Spec 08: Componentes KPI Cards

**Archivos:** `components/analytics/KpiCard.tsx` + `components/analytics/KpiCardsRow.tsx`
**Acción:** Crear
**Dependencias:** 06-hook (recibe props del hook)
**Bloquea:** 12-orchestrator

---

## KpiCard.tsx

### Props

```typescript
interface KpiCardProps {
  label: string;           // "Tareas Completadas"
  value: string;           // "24", "85%", "12.5h", "7 días"
  icon: React.ReactNode;   // Componente lucide-react
  iconBgClass: string;     // "bg-violet-500/20"
  iconColorClass: string;  // "text-violet-500"
  trend: {
    value: string;         // "+12%", "-2"
    isPositive: boolean;
  } | null;
}
```

### Layout (del diseño)

```
┌──────────────────────────────┐
│ [icon]              [+12% ↑] │  ← top row: icon + trend badge
│                              │
│ 24                           │  ← value (32px, bold, heading font)
│ Tareas Completadas           │  ← label (13px, muted)
└──────────────────────────────┘
```

### Estilos

- Container: `bg-secondary rounded-[24px] p-6 flex flex-col gap-3`
- Icon wrap: `w-10 h-10 rounded-xl flex items-center justify-center {iconBgClass}`
- Icon: `w-5 h-5 {iconColorClass}`
- Trend badge: `rounded-xl px-2 py-1 flex items-center gap-1 text-xs font-semibold`
  - Positivo: `bg-green-500/20 text-green-500 dark:text-green-400`
  - Negativo: `bg-red-500/20 text-red-500 dark:text-red-400`
  - Icon: `TrendingUp` (12px) o `TrendingDown` (12px)
- Value: `text-[32px] font-bold font-heading text-foreground`
- Label: `text-[13px] font-medium text-muted-foreground`

---

## KpiCardsRow.tsx

### Props

```typescript
interface KpiCardsRowProps {
  kpis: KpiData;
  trends: Record<keyof KpiData, KpiTrend>;
}
```

### Layout

```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Complet.│ │  Tasa   │ │  Focus  │ │  Racha  │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

- Container: `grid grid-cols-2 lg:grid-cols-4 gap-4`

### Mapeo de KPIs

| KPI | Icon | iconBgClass | iconColorClass | Formato valor |
|-----|------|-------------|----------------|---------------|
| completedCount | `CircleCheck` | `bg-violet-500/20` | `text-violet-500 dark:text-violet-400` | `${value}` |
| completionRate | `Target` | `bg-green-500/20` | `text-green-500 dark:text-green-400` | `${value}%` |
| focusTimeHours | `Brain` | `bg-amber-500/20` | `text-amber-500 dark:text-amber-400` | `${value}h` |
| currentStreak | `Flame` | `bg-red-500/20` | `text-red-500 dark:text-red-400` | `${value} días` |

### Formato de trends

- `trend.value > 0`: `"+${value}"` o `"+${value}%"` según KPI
- `trend.value < 0`: `"${value}"` (el signo negativo ya está)
- `trend.value === 0`: `null` (no mostrar badge)

## Verificación

- 4 KPIs se renderizan en una fila (desktop) o 2x2 (mobile)
- Badges de tendencia muestran color correcto (verde/rojo)
- Valores formateados correctamente
- Dark mode: colores responden
