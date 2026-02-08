# Spec 03: Utilidades Pomodoro

**Archivo:** `lib/pomodoro-utils.ts`
**Acción:** Crear
**Dependencias:** `01-types`
**Bloquea:** `06-hook`
**Paralelizable con:** `02-constants`, `04-navigation`, `05-route-skeleton`

---

## Funciones puras a implementar

Sigue el patrón de `lib/calendar-utils.ts`: funciones sin side effects, importan solo tipos.

### `generateSessionPlan(config: PomodoroConfig): PomodoroSession[]`

Genera el array completo de sesiones que caben dentro de `totalDurationMinutes`.

**Algoritmo:**
1. `focusCount = 0`, `timeUsed = 0`, `sessions = []`
2. Mientras quede tiempo para al menos una sesión de focus:
   a. Añadir sesión focus (`focusCount++`, label `"Focus #N"`)
   b. `timeUsed += focusMinutes`
   c. Si `focusCount` es múltiplo de `longBreakInterval` Y queda tiempo:
      - Añadir long break
      - `timeUsed += longBreakMinutes`
   d. Sino, si queda tiempo para short break Y habrá más sesiones:
      - Añadir short break
      - `timeUsed += shortBreakMinutes`
3. Asignar `index` secuencial a cada sesión
4. Todas las sesiones empiezan con `taskId: null`

**Ejemplo con defaults (4h, 25min, 5min, 15min, cada 4):**
```
Focus #1 (25min) → Short Break (5min) → Focus #2 (25min) → Short Break (5min) →
Focus #3 (25min) → Short Break (5min) → Focus #4 (25min) → Long Break (15min) →
Focus #5 (25min) → Short Break (5min) → Focus #6 (25min) → Short Break (5min) →
Focus #7 (25min) → Short Break (5min) → Focus #8 (25min)
= 200min focus + 30min short + 15min long = 245min ≈ 4h 05min
```

### `calculatePlanSummary(sessions: PomodoroSession[])`

```typescript
interface PlanSummary {
  focusCount: number;
  shortBreakCount: number;
  longBreakCount: number;
  totalFocusMinutes: number;
  totalBreakMinutes: number;
  totalMinutes: number;
}
```

Cuenta sesiones por tipo y suma duraciones.

### `formatMinutesAsHoursMinutes(minutes: number): string`

| Input | Output |
|-------|--------|
| 240 | `"4h 00m"` |
| 200 | `"3h 20m"` |
| 25 | `"25m"` |
| 60 | `"1h 00m"` |

Si `hours === 0`, solo muestra minutos.

### `formatSecondsAsTimer(seconds: number): string`

| Input | Output |
|-------|--------|
| 1122 | `"18:42"` |
| 300 | `"05:00"` |
| 61 | `"01:01"` |
| 5 | `"00:05"` |

Siempre formato `MM:SS` con padding de ceros.

### `distributeTasksToSessions(sessions: PomodoroSession[], taskIds: string[]): PomodoroSession[]`

Asigna `taskIds` a sesiones de tipo `focus` en round-robin:
- Si hay 3 tareas y 8 focus: T1, T2, T3, T1, T2, T3, T1, T2
- Si no hay tareas: todas las sesiones focus con `taskId: null`
- Los breaks siempre `taskId: null`
- Retorna nuevo array (no muta el original)

## Verificación

- `npm run build` compila sin errores
- Ejemplo: `generateSessionPlan(POMODORO_DEFAULTS)` retorna 15 sesiones (8 focus + 6 short + 1 long)
- `calculatePlanSummary(...)` calcula correctamente los totales
- `formatSecondsAsTimer(1122)` retorna `"18:42"`
