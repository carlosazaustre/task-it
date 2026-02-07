# 03 - Utilidades de Fecha

## Archivo

`lib/calendar-utils.ts`

## Principios

- **Funciones puras**: sin efectos secundarios, sin dependencias de estado
- **Sin librerías externas**: `Date` nativo + `Intl.DateTimeFormat` es suficiente para el MVP
- **Semana empieza en Lunes**: convención española (ISO 8601)
- **Locale español**: usar `Intl.DateTimeFormat('es-ES', ...)` para formateo

## Funciones existentes a reutilizar

De `lib/utils.ts`:
- `isSameDay(date1: Date, date2: Date): boolean` (línea 76)
- `formatShortDate(date: string): string` (línea 65) - formato "15 Feb"
- `formatTime(date: string): string` (línea 88) - formato "14:30"

---

## Tipos

```typescript
export type CalendarViewType = 'month' | 'week' | 'day';
```

> Se añade a `lib/types.ts`

---

## Funciones de generación de grid

### `getMonthGrid(year: number, month: number): Date[][]`

Genera una matriz de 5-6 filas x 7 columnas para el grid mensual. Incluye días del mes anterior/siguiente para completar las semanas.

```
Ejemplo para Febrero 2025:
[
  [27 Ene, 28 Ene, 29 Ene, 30 Ene, 31 Ene, 1 Feb, 2 Feb],
  [3 Feb, 4 Feb, 5 Feb, 6 Feb, 7 Feb, 8 Feb, 9 Feb],
  [10 Feb, 11 Feb, 12 Feb, 13 Feb, 14 Feb, 15 Feb, 16 Feb],
  [17 Feb, 18 Feb, 19 Feb, 20 Feb, 21 Feb, 22 Feb, 23 Feb],
  [24 Feb, 25 Feb, 26 Feb, 27 Feb, 28 Feb, 1 Mar, 2 Mar],
]
```

**Algoritmo**:
1. Obtener primer día del mes (`new Date(year, month, 1)`)
2. Calcular qué día de la semana es (ajustar para que Lunes = 0)
3. Retroceder al lunes de esa semana
4. Llenar filas de 7 hasta cubrir todo el mes + días restantes de la última semana
5. Mínimo 5 filas, máximo 6

### `getWeekDates(date: Date): Date[]`

Devuelve array de 7 fechas (Lun-Dom) para la semana que contiene `date`.

```
Ejemplo para 6 Feb 2025 (Jueves):
[3 Feb, 4 Feb, 5 Feb, 6 Feb, 7 Feb, 8 Feb, 9 Feb]
```

### `getWeekStart(date: Date): Date`

Devuelve el Lunes de la semana que contiene `date`.

**Nota**: `Date.getDay()` en JS devuelve 0=Domingo. Hay que ajustar:
```typescript
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Lunes = 1, Domingo retrocede 6
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
```

### `getDayHours(startHour?: number, endHour?: number): number[]`

Devuelve array de horas para renderizar el eje temporal.

```
getDayHours(8, 18) → [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
```

---

## Funciones de rango

### `getMonthDateRange(year: number, month: number): { start: Date; end: Date }`

Rango visible en el grid mensual (incluye días de meses adyacentes).

### `getWeekDateRange(date: Date): { start: Date; end: Date }`

Rango de Lunes 00:00:00 a Domingo 23:59:59 de la semana.

### `getDayDateRange(date: Date): { start: Date; end: Date }`

Rango del día: 00:00:00 a 23:59:59.

---

## Funciones de navegación

### `addMonths(date: Date, count: number): Date`

Avanza/retrocede meses. Maneja overflow de días (ej: 31 Ene + 1 mes = 28 Feb).

### `addWeeks(date: Date, count: number): Date`

Avanza/retrocede semanas (count * 7 días).

### `addDays(date: Date, count: number): Date`

Avanza/retrocede días.

---

## Funciones de formateo (español)

### `formatMonthYear(date: Date): string`

```
formatMonthYear(new Date(2025, 1)) → "Febrero 2025"
```

Usa: `Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })`

### `formatWeekRange(weekStart: Date): string`

```
formatWeekRange(new Date(2025, 1, 3)) → "Semana del 3 al 9 de Febrero"
```

Lógica: calcular día final (weekStart + 6), formatear con `Intl.DateTimeFormat`.

### `formatDayFull(date: Date): string`

```
formatDayFull(new Date(2025, 1, 6)) → "Jueves, 6 de Febrero"
```

Usa: `Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })`

### `formatWeekdayShort(index: number): string`

Devuelve la etiqueta corta del día de la semana (Lun, Mar, Mié, Jue, Vie, Sáb, Dom). Se usa en el header del grid mensual.

### `formatWeekdayLetter(index: number): string`

Devuelve la letra del día (L, M, X, J, V, S, D). Se usa en el header de la vista semanal y mini-calendario.

### `formatHour(hour: number): string`

```
formatHour(9)  → "9 AM"
formatHour(14) → "2 PM"
```

### `getWeekNumber(date: Date): number`

Número de semana ISO para el label "Semana 6".

---

## Funciones de comparación

### `isSameMonth(a: Date, b: Date): boolean`

Compara año + mes de dos fechas.

### `isToday(date: Date): boolean`

Compara con la fecha actual (usa `isSameDay` de `lib/utils.ts`).

---

## Funciones de filtrado de tareas

### `getTasksForDate(tasks: Task[], date: Date): Task[]`

Filtra tareas cuyo `dueDate` coincide con el día dado. Ignora tareas sin `dueDate`.

```typescript
function getTasksForDate(tasks: Task[], date: Date): Task[] {
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    return isSameDay(new Date(task.dueDate), date);
  });
}
```

### `getTasksInRange(tasks: Task[], start: Date, end: Date): Task[]`

Filtra tareas cuyo `dueDate` cae dentro del rango [start, end].

### `groupTasksByDate(tasks: Task[]): Map<string, Task[]>`

Agrupa tareas por clave de fecha (formato "YYYY-MM-DD") para lookup O(1) en MonthView.

```typescript
function groupTasksByDate(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const key = task.dueDate.slice(0, 10); // "2025-02-06"
    const existing = map.get(key) || [];
    existing.push(task);
    map.set(key, existing);
  }
  return map;
}
```

### `dateToKey(date: Date): string`

Convierte Date a clave "YYYY-MM-DD" para usar con `groupTasksByDate`.

---

## Helpers de URL params

### `dateToParam(date: Date, view: CalendarViewType): string`

```
dateToParam(new Date(2025, 1, 6), 'month') → "2025-02"
dateToParam(new Date(2025, 1, 6), 'week')  → "2025-02-03"  (lunes de la semana)
dateToParam(new Date(2025, 1, 6), 'day')   → "2025-02-06"
```

### `paramToDate(param: string): Date`

```
paramToDate("2025-02")    → new Date(2025, 1, 1)
paramToDate("2025-02-06") → new Date(2025, 1, 6)
```

---

## Constantes nuevas para `lib/constants.ts`

```typescript
export const CALENDAR_VIEWS: { value: CalendarViewType; label: string }[] = [
  { value: 'month', label: 'Mes' },
  { value: 'week', label: 'Semana' },
  { value: 'day', label: 'Día' },
];

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const WEEKDAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const CALENDAR_DEFAULTS = {
  START_HOUR: 8,
  END_HOUR: 18,
  HOUR_HEIGHT_PX: 80,
  WEEK_HOUR_HEIGHT_PX: 60,
} as const;
```
