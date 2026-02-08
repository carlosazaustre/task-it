# Spec 07: Componente AnalyticsHeader

**Archivo:** `components/analytics/AnalyticsHeader.tsx`
**Acción:** Crear
**Dependencias:** 06-hook (recibe props del hook)
**Bloquea:** 12-orchestrator

---

## Props

```typescript
interface AnalyticsHeaderProps {
  dateRange: AnalyticsDateRange;
  onDateRangeChange: (range: AnalyticsDateRange) => void;
}
```

## Diseño (del frame Pencil)

```
┌──────────────────────────────────────────────────────────┐
│ Dashboard                          [Esta semana ▼] [Exportar] │
│ Resumen de tu productividad y progreso                       │
└──────────────────────────────────────────────────────────┘
```

## Implementación

Reutiliza `PageHeader` existente (`components/layout/PageHeader.tsx`):

```tsx
<PageHeader
  title="Dashboard"
  subtitle="Resumen de tu productividad y progreso"
  showSearch={false}
  actions={<>{/* DateRangePicker + ExportButton */}</>}
/>
```

### Date Range Picker (pill)

- Botón styled: `bg-secondary rounded-[24px] px-[18px] py-2.5 text-sm font-semibold text-muted-foreground`
- Iconos: `CalendarDays` (16px) + label actual + `ChevronDown` (14px)
- On click: toggle dropdown
- Dropdown: `absolute right-0 top-full mt-2 bg-background border border-border rounded-[14px] shadow-lg py-2 z-10`
- Items: opciones de `ANALYTICS_DATE_RANGES`, on click → `onDateRangeChange(value)`
- Click outside → cierra (useRef + useEffect)

### Botón Exportar

- `Button variant="primary"` con `Download` icon (16px) + "Exportar"
- **MVP: `disabled` con `title="Disponible próximamente"`**

## Verificación

- El selector muestra las 4 opciones de rango
- Cambiar el rango llama a `onDateRangeChange`
- El dropdown se cierra al hacer click fuera
- El botón Exportar está deshabilitado (MVP)
- Dark mode: colores responden correctamente
