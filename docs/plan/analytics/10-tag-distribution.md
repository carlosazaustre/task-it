# Spec 10: Distribución por Etiquetas

**Archivo:** `components/analytics/TagDistribution.tsx`
**Acción:** Crear
**Dependencias:** 06-hook (recibe props del hook)
**Bloquea:** 12-orchestrator

---

## Props

```typescript
interface TagDistributionProps {
  data: TagCount[];     // Tags con conteo, ordenados desc
  totalTasks: number;   // Total de tareas en el rango
}
```

## Layout (del diseño)

```
┌────────────────────────────────────────────┐
│ Distribución por Etiquetas                 │
│                                            │
│   ┌─────────┐   Trabajo     ██████████ 10  │
│   │  (24)   │   Urgente     ██████     6   │
│   │  donut  │   Personal    █████      5   │
│   └─────────┘   Reunión     ███        3   │
└────────────────────────────────────────────┘
```

## Implementación

### Container
- `bg-secondary rounded-[24px] p-6 flex flex-col gap-5 flex-1`

### Título
- `text-lg font-bold font-heading text-foreground` → "Distribución por Etiquetas"

### Content row
- `flex items-center gap-6` (desktop)
- `flex flex-col gap-6` (mobile: `flex-col`)

### Donut Chart (SVG puro)

SVG viewBox `0 0 140 140`, centrado en (70, 70):

```tsx
const radius = 55;
const circumference = 2 * Math.PI * radius; // ~345.57

// Para cada segmento:
const segmentLength = (count / totalTasks) * circumference;
const segmentOffset = circumference - cumulativeLength;

<circle
  cx="70" cy="70" r={radius}
  fill="none"
  stroke={tagColorHex}
  strokeWidth="14"
  strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
  strokeDashoffset={-cumulativeOffset}
  strokeLinecap="round"
  transform="rotate(-90 70 70)"
/>
```

- Fondo del donut: circle con `stroke={border-color}` strokeWidth 14
- Centro: frame con total → `text-2xl font-bold text-foreground` + `text-xs text-muted-foreground` "tareas"

Si `totalTasks === 0`: donut gris completo con "0" en el centro.

### Tag Color Map

Mapa de `TagColor` a hex para el SVG stroke:

```typescript
const TAG_COLOR_HEX: Record<string, string> = {
  red: '#ef4444', orange: '#f97316', amber: '#f59e0b',
  yellow: '#eab308', lime: '#84cc16', green: '#22c55e',
  emerald: '#10b981', teal: '#14b8a6', cyan: '#06b6d4',
  sky: '#0ea5e9', blue: '#3b82f6', indigo: '#6366f1',
  violet: '#8b5cf6', purple: '#a855f7', fuchsia: '#d946ef',
  pink: '#ec4899', rose: '#f43f5e',
};
```

### Tag List

- Container: `flex flex-col gap-3 flex-1`
- Cada row: `flex flex-col gap-1.5`
  - Top: `flex items-center justify-between`
    - Left: `flex items-center gap-2`
      - Dot: `w-2.5 h-2.5 rounded-[5px]` con `style={{ backgroundColor: tagColorHex }}`
      - Name: `text-[13px] font-semibold text-foreground`
    - Count: `text-[13px] text-muted-foreground`
  - Progress bar: `h-1.5 bg-background rounded-full overflow-hidden`
    - Fill: `h-full rounded-full` con `style={{ width: percentage, backgroundColor: tagColorHex }}`

## Verificación

- Donut SVG renderiza segmentos proporcionales
- Centro muestra total correcto
- Tag rows muestran dot, nombre, count y progress bar
- Con 0 tags: donut gris + sin rows
- Dark mode: colores responden
- Responsive: layout cambia a vertical en mobile
