# Spec 09: Gráfico de Actividad Semanal

**Archivo:** `components/analytics/WeeklyActivityChart.tsx`
**Acción:** Crear
**Dependencias:** 06-hook (recibe props del hook)
**Bloquea:** 12-orchestrator

---

## Props

```typescript
interface WeeklyActivityChartProps {
  data: DailyActivity[];  // 7 entradas (Lun-Dom)
}
```

## Layout (del diseño)

```
┌────────────────────────────────────────────────────┐
│ Actividad Semanal              ● Completadas       │
│                                ● Pendientes        │
│                                                    │
│  ██      ██                                        │
│  ██  ██  ██              ██                        │
│  ██  ██  ██  ██  ██  ██  ██                       │
│  ██  ░░  ██  ░░  ██  ░░  ██  ░░  ██  ░░  ██  ░░  │
│ Lun Mar Mié Jue Vie Sáb Dom                       │
└────────────────────────────────────────────────────┘
```

## Implementación — CSS puro (sin librería de charts)

### Container
- `bg-secondary rounded-[24px] p-6 flex flex-col gap-5`

### Header row
- `flex items-center justify-between w-full`
- Título: `text-lg font-bold font-heading text-foreground` → "Actividad Semanal"
- Leyenda: `flex items-center gap-4`
  - Item: `flex items-center gap-1.5`
    - Dot: `w-2.5 h-2.5 rounded-[5px]`
    - Completadas: dot `bg-primary`, text `text-xs text-muted-foreground`
    - Pendientes: dot `bg-border`, text `text-xs text-muted-foreground`

### Chart area
- `flex items-end justify-around h-[200px] px-4`

### Day column
- `flex flex-col items-center gap-2`
- Bars wrapper: `flex items-end gap-1`
  - Bar completadas: `bg-primary rounded-t-[8px] w-7 transition-all` + height dinámico
  - Bar pendientes: `bg-border rounded-t-[8px] w-7 transition-all` + height dinámico
- Day label: `text-xs font-medium text-muted-foreground`
  - Día actual (hoy): `text-foreground font-semibold`

### Cálculo de alturas

```typescript
const maxValue = Math.max(...data.flatMap(d => [d.completed, d.pending]), 1);
const barHeight = (value: number) => Math.max((value / maxValue) * 180, value > 0 ? 4 : 0);
// Min 4px si hay valor > 0, 0 si no hay datos
```

Height se aplica con `style={{ height: barHeight(value) }}`.

### Empty state

Si todos los valores son 0, mostrar las barras vacías (height 0) con un texto centrado: "Sin actividad esta semana" en `text-muted-foreground text-sm`.

## Verificación

- 7 columnas se renderizan (Lun-Dom)
- Barras tienen altura proporcional
- Leyenda muestra los colores correctos
- Día actual resaltado
- Con 0 datos: muestra empty state
- Responsive: barras se adaptan al ancho disponible
- Dark mode: colores responden
