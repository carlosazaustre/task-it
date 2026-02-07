# Vista Calendario - Plan de Implementación

## Overview

Implementar una vista calendario para Task-It que permita visualizar tareas por fecha en tres modos: **mensual**, **semanal** y **diario**, inspirada en Google Calendar. Las tareas se posicionan según su campo `dueDate` existente.

## Alcance MVP

- Vista mensual: grid de 7 columnas (Lun-Dom) x 5-6 filas, tareas como badges de color
- Vista semanal: eje temporal vertical (horas) x 7 columnas (días), tareas como bloques
- Vista diaria: timeline de horas + sidebar con mini-calendario y lista de tareas del día
- Switcher para cambiar entre vistas (Mes / Semana / Día)
- Navegación temporal (anterior/siguiente periodo, botón "Hoy")
- Clic en tarea abre modal de edición (reutiliza TaskForm existente)

## Fuera de alcance (futuro)

- Drag & drop para mover tareas entre días
- Creación de tarea directa desde el calendario (clic en celda vacía)
- Selector de hora en el formulario de tarea (las tareas son "all-day" por ahora)
- Vista de año
- Recurrencia de tareas

## Diseños de referencia

Los diseños están en `docs/design/task-it.pen` con tres frames:
- **Vista Mensual** (frame `y8URv`)
- **Vista Semanal** (frame `lD6Re`)
- **Vista Diaria** (frame `uVs7n`)

## Especificaciones

| # | Documento | Descripción |
|---|-----------|-------------|
| 1 | [01-routing.md](./01-routing.md) | Estrategia de routing y navegación |
| 2 | [02-components.md](./02-components.md) | Arquitectura de componentes |
| 3 | [03-date-utils.md](./03-date-utils.md) | Utilidades de fecha |
| 4 | [04-hooks.md](./04-hooks.md) | Hook useCalendar |
| 5 | [05-implementation-phases.md](./05-implementation-phases.md) | Fases de implementación |

## Stack

- **Framework**: Next.js 16 App Router
- **Routing**: URL search params para estado de vista/fecha
- **Fechas**: `Date` nativo + `Intl.DateTimeFormat('es-ES')` (sin librerías externas)
- **Styling**: Tailwind CSS v4 con variables CSS (dark mode compatible)
- **Iconos**: lucide-react (ChevronLeft, ChevronRight, Calendar, etc.)
