# Spec 01: Tipos Pomodoro

**Archivo:** `lib/types.ts`
**Acción:** Modificar (añadir al final)
**Dependencias:** Ninguna
**Bloquea:** 02-constants, 03-utils, 06-hook

---

## Tipos a añadir

```typescript
// Pomodoro Session Types
export type PomodoroSessionType = 'focus' | 'short_break' | 'long_break';

// Pomodoro Phase (estado general de la feature)
export type PomodoroPhase = 'setup' | 'active' | 'completed';

// Configuración del Pomodoro (persistida en localStorage)
export interface PomodoroConfig {
  totalDurationMinutes: number;   // Duración total jornada en minutos (ej: 240 = 4h)
  focusMinutes: number;           // Duración sesión de focus (ej: 25)
  shortBreakMinutes: number;      // Duración short break (ej: 5)
  longBreakMinutes: number;       // Duración long break (ej: 15)
  longBreakInterval: number;      // Long break cada N sesiones de focus (ej: 4)
}

// Sesión individual dentro del plan
export interface PomodoroSession {
  index: number;                  // Índice 0-based en el plan
  type: PomodoroSessionType;
  durationMinutes: number;
  taskId: string | null;          // ID de tarea asignada (null para breaks)
  label: string;                  // Etiqueta: "Focus #1", "Short Break", "Long Break"
}

// Estado completo del Pomodoro (persistido en localStorage)
export interface PomodoroState {
  phase: PomodoroPhase;
  config: PomodoroConfig;
  sessions: PomodoroSession[];
  taskIds: string[];              // IDs de tareas seleccionadas para la jornada
  currentSessionIndex: number;
  timeRemainingSeconds: number;
  isPaused: boolean;
  startedAt: string | null;       // ISO 8601
}
```

## Verificación

- `npm run build` compila sin errores
- Los tipos son importables desde `@/lib/types`
