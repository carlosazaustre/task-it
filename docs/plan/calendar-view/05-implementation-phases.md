# 05 - Fases de Implementación

## Resumen

La implementación se divide en 5 fases secuenciales. Cada fase produce un resultado funcional e independiente que se puede verificar antes de avanzar.

---

## Fase 1: Fundación (routing + date utils)

### Objetivo
Establecer la infraestructura de routing y las utilidades de fecha.

### Paso 1.1: Tipos y constantes
- **`lib/types.ts`**: añadir `CalendarViewType`
- **`lib/constants.ts`**: añadir `CALENDAR_VIEWS`, `WEEKDAY_LABELS`, `WEEKDAY_LETTERS`, `CALENDAR_DEFAULTS`

### Paso 1.2: Utilidades de fecha
- **Crear `lib/calendar-utils.ts`**: todas las funciones puras descritas en [03-date-utils.md](./03-date-utils.md)
- Sin dependencias externas

### Paso 1.3: Hook useCalendar
- **Crear `hooks/useCalendar.ts`**: estado basado en URL params, descrito en [04-hooks.md](./04-hooks.md)

### Paso 1.4: Navegación e infraestructura de layout
- **Modificar `components/layout/NavItem.tsx`**: renderizar `<Link>` cuando `href` existe
- **Modificar `components/layout/Sidebar.tsx`**: usar `usePathname()`, pasar `href` a NavItems
- **Crear `components/layout/AppShell.tsx`**: wrapper Sidebar + main compartido
- **Modificar `components/layout/index.ts`**: exportar AppShell
- **Refactorizar `app/page.tsx`**: usar AppShell en lugar del layout inline
- **Crear `app/calendar/page.tsx`**: página skeleton con AppShell + placeholder

### Verificación Fase 1
```bash
npm run build    # Compila sin errores
npm run lint     # Sin warnings
npm run dev      # Navegar entre / y /calendar funciona
                 # Sidebar marca la ruta activa correctamente
                 # Browser back/forward funciona
```

---

## Fase 2: Chrome compartido del calendario

### Objetivo
Implementar los controles de cabecera que son comunes a las tres vistas.

### Paso 2.1: ViewSwitcher
- **Crear `components/calendar/ViewSwitcher.tsx`**
- Toggle pills Mes/Semana/Día

### Paso 2.2: CalendarNavigation
- **Crear `components/calendar/CalendarNavigation.tsx`**
- Botones prev/next (ChevronLeft/ChevronRight), label de periodo, botón "Hoy"

### Paso 2.3: CalendarHeader
- **Crear `components/calendar/CalendarHeader.tsx`**
- Compone título + subtítulo + ViewSwitcher + CalendarNavigation

### Paso 2.4: CalendarTaskBadge
- **Crear `components/calendar/CalendarTaskBadge.tsx`**
- Badge de tarea con color del tag

### Paso 2.5: Integración
- Actualizar `app/calendar/page.tsx` para renderizar CalendarHeader funcional
- El ViewSwitcher cambia URL params, la navegación avanza/retrocede periodos

### Verificación Fase 2
```bash
npm run dev      # CalendarHeader visible en /calendar
                 # ViewSwitcher cambia ?view= en la URL
                 # Prev/Next cambia ?date= en la URL
                 # "Hoy" resetea a fecha actual
                 # Funciona en dark mode
```

---

## Fase 3: Vista Mensual

### Objetivo
Implementar la vista más fundamental: el grid mensual.

### Paso 3.1: MonthDayCell
- **Crear `components/calendar/MonthDayCell.tsx`**
- Celda con número de día, badges de tareas, estados (hoy, otro mes)

### Paso 3.2: MonthView
- **Crear `components/calendar/MonthView.tsx`**
- Header de días de la semana + grid de MonthDayCells
- CSS Grid 7 columnas

### Paso 3.3: CalendarView (orquestador)
- **Crear `components/calendar/CalendarView.tsx`**
- Conecta useCalendar + useTasks + useTags
- Filtra tareas por visibleRange
- Renderiza CalendarHeader + MonthView
- Incluye modal de edición de tarea

### Paso 3.4: Wiring
- **Actualizar `app/calendar/page.tsx`** para renderizar CalendarView con Suspense
- **Crear `components/calendar/index.ts`** con barrel exports

### Verificación Fase 3
```bash
npm run dev      # Grid mensual visible con días correctos
                 # Tareas con dueDate aparecen como badges en su día
                 # Hoy está destacado
                 # Días del mes anterior/siguiente en gris
                 # Clic en badge abre modal de edición
                 # Cambiar tarea se refleja inmediatamente
                 # Prev/Next navega entre meses
                 # Dark mode funciona correctamente
                 # Responsive: se adapta a mobile
```

---

## Fase 4: Vista Semanal

### Objetivo
Grid semanal con eje temporal vertical.

### Paso 4.1: WeekView
- **Crear `components/calendar/WeekView.tsx`**
- Columna de horas + 7 columnas de día
- Header con letra + número de día
- Bloques de tareas (all-day para MVP)
- Scroll vertical para las horas

### Paso 4.2: Integración
- Actualizar `CalendarView.tsx` para renderizar WeekView cuando `view === 'week'`

### Verificación Fase 4
```bash
npm run dev      # Vista semanal visible con 7 columnas
                 # Eje de horas a la izquierda
                 # Tareas del día aparecen como bloques
                 # Hoy columna destacada
                 # Navegación prev/next funciona por semanas
                 # Dark mode correcto
                 # Responsive: scroll horizontal en mobile
```

---

## Fase 5: Vista Diaria

### Objetivo
Vista de dos columnas con timeline + sidebar informativo.

### Paso 5.1: MiniCalendar
- **Crear `components/calendar/MiniCalendar.tsx`**
- Calendario compacto mensual
- Clic en día navega a esa fecha
- Dots en días con tareas

### Paso 5.2: DayTimeline
- **Crear `components/calendar/DayTimeline.tsx`**
- Timeline de horas con bloques de tareas

### Paso 5.3: DayView
- **Crear `components/calendar/DayView.tsx`**
- Layout dos columnas: DayTimeline + sidebar (MiniCalendar + lista tareas)
- Responsive: stacked en mobile

### Paso 5.4: Integración
- Actualizar `CalendarView.tsx` para renderizar DayView cuando `view === 'day'`
- Añadir navegación MonthDayCell → DayView (clic en celda de mes)

### Verificación Fase 5
```bash
npm run dev      # Vista diaria con timeline y sidebar
                 # MiniCalendar muestra mes actual
                 # Clic en día del MiniCalendar navega
                 # Lista de tareas del día en sidebar
                 # Bloques de tareas en timeline
                 # Responsive: columnas apiladas en mobile
                 # Dark mode correcto
                 # Clic en celda de MonthView navega a DayView
```

---

## Resumen de archivos

### Archivos nuevos (16)

| Fase | Archivo |
|------|---------|
| 1 | `lib/calendar-utils.ts` |
| 1 | `hooks/useCalendar.ts` |
| 1 | `components/layout/AppShell.tsx` |
| 1 | `app/calendar/page.tsx` |
| 2 | `components/calendar/ViewSwitcher.tsx` |
| 2 | `components/calendar/CalendarNavigation.tsx` |
| 2 | `components/calendar/CalendarHeader.tsx` |
| 2 | `components/calendar/CalendarTaskBadge.tsx` |
| 3 | `components/calendar/MonthDayCell.tsx` |
| 3 | `components/calendar/MonthView.tsx` |
| 3 | `components/calendar/CalendarView.tsx` |
| 3 | `components/calendar/index.ts` |
| 4 | `components/calendar/WeekView.tsx` |
| 5 | `components/calendar/MiniCalendar.tsx` |
| 5 | `components/calendar/DayTimeline.tsx` |
| 5 | `components/calendar/DayView.tsx` |

### Archivos modificados (6)

| Fase | Archivo | Cambio |
|------|---------|--------|
| 1 | `lib/types.ts` | Añadir `CalendarViewType` |
| 1 | `lib/constants.ts` | Añadir constantes de calendario |
| 1 | `components/layout/NavItem.tsx` | Soportar `<Link>` via `href` |
| 1 | `components/layout/Sidebar.tsx` | `usePathname()` + pasar `href` |
| 1 | `components/layout/index.ts` | Exportar AppShell |
| 1 | `app/page.tsx` | Usar AppShell |

---

## Verificación final

```bash
# Build completo
npm run build

# Lint
npm run lint

# Test manual completo:
# 1. Navegar a /calendar desde sidebar
# 2. Cambiar entre vistas Mes/Semana/Día
# 3. Navegar periodos con prev/next
# 4. Clic "Hoy" vuelve a fecha actual
# 5. Verificar tareas aparecen en sus fechas
# 6. Editar tarea desde calendario
# 7. Verificar dark mode en las 3 vistas
# 8. Verificar responsive en las 3 vistas
# 9. Verificar URL params cambian correctamente
# 10. Verificar browser back/forward
```
