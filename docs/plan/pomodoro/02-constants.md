# Spec 02: Constantes Pomodoro

**Archivo:** `lib/constants.ts`
**Acción:** Modificar (añadir al final)
**Dependencias:** `01-types`
**Bloquea:** `06-hook`
**Paralelizable con:** `03-utils`, `04-navigation`, `05-route-skeleton`

---

## Constantes a añadir

### STORAGE_KEYS (ampliar objeto existente)

```typescript
export const STORAGE_KEYS = {
  TASKS: 'task-it-tasks',
  TAGS: 'task-it-tags',
  POMODORO_CONFIG: 'task-it-pomodoro-config',
  POMODORO_STATE: 'task-it-pomodoro-state',
} as const;
```

### Config por defecto

```typescript
import type { PomodoroConfig } from './types';

export const POMODORO_DEFAULTS: PomodoroConfig = {
  totalDurationMinutes: 240,    // 4 horas
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
};
```

### Opciones para los selects del Config Modal

```typescript
export const POMODORO_DURATION_OPTIONS = [
  { value: 120, label: '2 horas' },
  { value: 240, label: '4 horas' },
  { value: 360, label: '6 horas' },
  { value: 480, label: '8 horas' },
];

export const POMODORO_FOCUS_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 25, label: '25 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 50, label: '50 min' },
];

export const POMODORO_SHORT_BREAK_OPTIONS = [
  { value: 3, label: '3 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
];

export const POMODORO_LONG_BREAK_OPTIONS = [
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
];

export const POMODORO_INTERVAL_OPTIONS = [
  { value: 2, label: '2 sesiones' },
  { value: 3, label: '3 sesiones' },
  { value: 4, label: '4 sesiones' },
  { value: 5, label: '5 sesiones' },
];
```

## Verificación

- `npm run build` compila sin errores
- `STORAGE_KEYS.POMODORO_CONFIG` y `STORAGE_KEYS.POMODORO_STATE` son accesibles
- `POMODORO_DEFAULTS` tiene los valores correctos
