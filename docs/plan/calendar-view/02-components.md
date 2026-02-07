# 02 - Arquitectura de Componentes

## Directorio

```
components/calendar/
├── CalendarView.tsx          # Orquestador principal
├── CalendarHeader.tsx        # Título + controles
├── ViewSwitcher.tsx          # Toggle Mes/Semana/Día
├── CalendarNavigation.tsx    # Prev/Next + label + "Hoy"
├── MonthView.tsx             # Grid mensual
├── MonthDayCell.tsx          # Celda de día en grid mensual
├── WeekView.tsx              # Grid semanal con eje temporal
├── DayView.tsx               # Layout diario dos columnas
├── DayTimeline.tsx           # Timeline de horas (columna izquierda)
├── MiniCalendar.tsx          # Calendario compacto (sidebar diario)
├── CalendarTaskBadge.tsx     # Badge/pill de tarea
└── index.ts                  # Barrel exports
```

---

## CalendarView (Orquestador)

**Archivo**: `components/calendar/CalendarView.tsx`

Componente principal que conecta datos con vistas. Se usa en `app/calendar/page.tsx`.

**Responsabilidades**:
- Leer estado de `useCalendar()` (vista, fecha, navegación)
- Obtener tareas de `useTasks()` y tags de `useTags()`
- Filtrar tareas por `visibleRange` del hook
- Renderizar CalendarHeader + vista activa (MonthView | WeekView | DayView)
- Gestionar modal de edición de tarea (reutiliza `Modal` + `TaskForm`)

**Props**: ninguna (todo viene de hooks)

**Estructura**:
```tsx
<div>
  <CalendarHeader
    title="Calendario"
    subtitle={subtitle}       // dinámico según vista
    view={view}
    onViewChange={setView}
    periodLabel={periodLabel}
    onPrev={goToPrev}
    onNext={goToNext}
    onToday={goToToday}
  />

  {view === 'month' && <MonthView ... />}
  {view === 'week' && <WeekView ... />}
  {view === 'day' && <DayView ... />}

  <Modal isOpen={isEditing} onClose={closeEdit} title="Editar tarea" size="lg">
    <TaskForm ... />
  </Modal>
</div>
```

---

## CalendarHeader

**Archivo**: `components/calendar/CalendarHeader.tsx`

Sigue el patrón visual de `PageHeader` pero con controles de calendario.

**Props**:
```tsx
interface CalendarHeaderProps {
  title: string;
  subtitle: string;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  periodLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}
```

**Layout** (responsive):
```
Desktop:
┌─────────────────────────────────────────────────┐
│ Calendario                  [Mes|Sem|Día]       │
│ Subtítulo dinámico          [<] Feb 2025 [>] [Hoy] │
└─────────────────────────────────────────────────┘

Mobile:
┌─────────────────────────────┐
│ Calendario                  │
│ Subtítulo                   │
│ [Mes|Sem|Día]               │
│ [<] Feb 2025 [>] [Hoy]     │
└─────────────────────────────┘
```

---

## ViewSwitcher

**Archivo**: `components/calendar/ViewSwitcher.tsx`

Toggle de 3 opciones tipo "pill group".

**Props**:
```tsx
interface ViewSwitcherProps {
  value: CalendarViewType;
  onChange: (view: CalendarViewType) => void;
}
```

**Diseño**:
- Contenedor: `bg-secondary rounded-[26px] p-1 flex`
- Botón activo: `bg-primary text-white rounded-[22px]`
- Botón inactivo: `text-muted-foreground hover:text-foreground`
- Labels: "Mes", "Semana", "Día"
- Usa constante `CALENDAR_VIEWS` de `lib/constants.ts`

---

## CalendarNavigation

**Archivo**: `components/calendar/CalendarNavigation.tsx`

Controles de navegación temporal.

**Props**:
```tsx
interface CalendarNavigationProps {
  periodLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}
```

**Diseño**:
- Botones prev/next: 36x36px circular (`rounded-full`), icono ChevronLeft/ChevronRight de lucide-react
- Label del periodo centrado entre botones: "Febrero 2025" / "Semana 6" / "Jueves, 6 de Febrero"
- Botón "Hoy": usa componente `Button` existente con variant `primary`, size `sm`

---

## MonthView

**Archivo**: `components/calendar/MonthView.tsx`

Grid mensual completo.

**Props**:
```tsx
interface MonthViewProps {
  currentDate: Date;
  tasks: Task[];
  tags: Tag[];
  today: Date;
  onDayClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}
```

**Estructura**:
```
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ Lun  │ Mar  │ Mié  │ Jue  │ Vie  │ Sáb  │ Dom  │  ← header fijo
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│  27  │  28  │  29  │  30  │  31  │   1  │   2  │  ← días de mes anterior en gris
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│   3  │   4  │   5  │  [6] │   7  │   8  │   9  │  ← [6] = hoy destacado
│      │ ████ │      │ ████ │      │      │      │  ← badges de tareas
├──────┴──────┴──────┴──────┴──────┴──────┴──────┤
│  ...                                            │
└─────────────────────────────────────────────────┘
```

**Implementación**:
- CSS Grid: `grid-cols-7`
- Header: `WEEKDAY_LABELS` de constants ("Lun", "Mar", ...)
- Generar grid con `getMonthGrid()` de calendar-utils
- Agrupar tareas con `groupTasksByDate()` para lookup O(1)
- Bordes: `border-border` (1px)
- Border radius exterior: `rounded-[16px]`

---

## MonthDayCell

**Archivo**: `components/calendar/MonthDayCell.tsx`

Celda individual del grid mensual.

**Props**:
```tsx
interface MonthDayCellProps {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  tasks: Task[];
  tags: Tag[];
  onDayClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}
```

**Comportamiento**:
- Número de día arriba a la izquierda
- Si `isToday`: número con `bg-primary text-white rounded-full` (círculo)
- Si `!isCurrentMonth`: `text-muted-foreground opacity-50`
- Mostrar hasta 2-3 `CalendarTaskBadge` pills
- Si hay más tareas: texto "+N más" en `text-muted-foreground text-xs`
- Clic en celda → `onDayClick` (navega a vista diaria)
- Clic en badge → `onTaskClick` (abre modal edición)
- Altura responsive: `h-20 sm:h-24 lg:h-28`

---

## WeekView

**Archivo**: `components/calendar/WeekView.tsx`

Grid semanal con eje temporal.

**Props**:
```tsx
interface WeekViewProps {
  weekStart: Date;
  tasks: Task[];
  tags: Tag[];
  today: Date;
  onTaskClick: (task: Task) => void;
}
```

**Estructura**:
```
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│      │  L 3 │  M 4 │  X 5 │ [J 6]│  V 7 │  S 8 │  D 9│ ← header con día
├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ 8 AM │      │      │      │      │      │      │      │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ 9 AM │      │ ████ │      │ ████ │      │      │      │ ← bloques de tareas
├──────┤      │ ████ │      │ ████ │      │      │      │
│10 AM │      │      │      │      │      │      │      │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

**Implementación**:
- Columna izquierda fija (60px): etiquetas de hora
- 7 columnas de día: `grid-cols-[60px_repeat(7,1fr)]`
- Horas visibles: 8AM-18PM por defecto (constante `CALENDAR_DEFAULTS`)
- Contenedor scrollable verticalmente
- Bloques de tarea: posicionados absolutos dentro de la celda del día
- Columna de hoy: `bg-primary/5` (fondo sutil)
- Header de día: letra + número, hoy destacado con `bg-primary text-white rounded-full`
- Altura por hora: 60px (constante `WEEK_HOUR_HEIGHT_PX`)

**Nota MVP**: Como `dueDate` no incluye hora, las tareas se muestran como bloques "all-day" en la parte superior de cada día (similar a eventos de día completo en Google Calendar).

---

## DayView

**Archivo**: `components/calendar/DayView.tsx`

Layout de dos columnas para vista diaria.

**Props**:
```tsx
interface DayViewProps {
  date: Date;
  tasks: Task[];
  allTasks: Task[];
  tags: Tag[];
  today: Date;
  onDateSelect: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}
```

**Layout**:
```
┌──────────────────────────────┬─────────────────┐
│                              │  Mini Calendario │
│       DayTimeline            │  ┌─────────────┐│
│   8:00  ─────────────        │  │ Febrero 2025││
│   9:00  ████████████         │  │ L M X J V S D│
│  10:00  ─────────────        │  └─────────────┘│
│  11:00  ─────────────        │                  │
│  12:00  ████████████         │  Tareas de hoy   │
│  13:00  ─────────────        │  □ Tarea 1       │
│                              │  □ Tarea 2       │
│                              │  □ Tarea 3       │
└──────────────────────────────┴─────────────────┘
```

**Responsive**:
- Desktop: `flex flex-row`, sidebar derecho 320px
- Mobile: `flex flex-col`, sidebar debajo del timeline

---

## DayTimeline

**Archivo**: `components/calendar/DayTimeline.tsx`

Timeline de horas del día.

**Props**:
```tsx
interface DayTimelineProps {
  date: Date;
  tasks: Task[];
  tags: Tag[];
  onTaskClick: (task: Task) => void;
}
```

**Implementación**:
- Filas de hora: 8AM-18PM, 80px de altura cada una (`HOUR_HEIGHT_PX`)
- Etiqueta de hora a la izquierda: "8:00", "9:00", etc.
- Tareas como bloques coloreados de ancho completo
- Separadores horizontales entre horas: `border-border`
- **MVP**: tareas sin hora se muestran como lista al principio del día

---

## MiniCalendar

**Archivo**: `components/calendar/MiniCalendar.tsx`

Calendario mensual compacto en el sidebar de la vista diaria.

**Props**:
```tsx
interface MiniCalendarProps {
  currentMonth: Date;
  selectedDate: Date;
  tasksPerDay: Map<string, number>;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}
```

**Diseño**:
- Header: "Febrero 2025" + flechas prev/next mes
- Grid 7x6: días de la semana como header (L, M, X, J, V, S, D)
- Celdas de 28px de alto
- Día seleccionado: `bg-primary text-white rounded-full`
- Días con tareas: dot indicator debajo del número
- Días fuera del mes: `text-muted-foreground opacity-50`
- Background: `bg-card rounded-[16px] p-4`

---

## CalendarTaskBadge

**Archivo**: `components/calendar/CalendarTaskBadge.tsx`

Badge/pill que representa una tarea en el calendario.

**Props**:
```tsx
interface CalendarTaskBadgeProps {
  task: Task;
  tags: Tag[];
  compact?: boolean;    // true en MonthView, false en WeekView/DayView
  onClick?: () => void;
}
```

**Colores**: Reutilizar el mapeo de colores de tag que ya existe en `TaskCard.tsx` (líneas ~33-88). El color se determina por el primer tag de la tarea. Si no tiene tags, usa el color primary por defecto.

**Variantes**:
- `compact=true` (MonthView): pill pequeño, solo título truncado, `text-xs`, `py-0.5 px-1.5`
- `compact=false` (WeekView/DayView): bloque más grande, título + tiempo, `text-sm`, `p-2`

**Ejemplo de estilos** (tag azul):
```tsx
className="bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-md truncate cursor-pointer hover:opacity-80"
```

---

## Componentes reutilizados (sin cambios)

| Componente | Uso en Calendario |
|------------|-------------------|
| `Button` | Botón "Hoy", acciones |
| `Modal` | Modal de edición de tarea |
| `TaskForm` | Formulario dentro del modal |
| `Sidebar` | Navegación lateral (via AppShell) |
| `PageHeader` | Patrón de referencia para CalendarHeader |
