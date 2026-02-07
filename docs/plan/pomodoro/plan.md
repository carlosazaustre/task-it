# Plan: Funcionalidad Pomodoro para Task-It

## Contexto

Task-It necesita una funcionalidad de Pomodoro que permita al usuario configurar una jornada de trabajo, calcular automáticamente las sesiones de focus/breaks, asignar tareas a las sesiones, y ejecutar un timer en tiempo real. Los diseños ya existen en `docs/design/task-it.pen` con 3 pantallas: Session Setup, Active Session y Config Modal.

## Pantallas del diseño

### 1. Session Setup
- Header con título "Pomodoro" + botones "Configurar" y "Iniciar Jornada"
- 4 stat cards: Duración Jornada, Focus Time, Short/Long Break, Sesiones Totales
- Columna izquierda: "Tareas de la Jornada" (lista de tareas seleccionadas)
- Columna derecha (320px): "Plan de Sesiones" (lista generada de focus/breaks con tarea asignada)

### 2. Active Session
- Top bar: badge sesión actual + nombre de tarea + botón "Detener Jornada"
- Timer circular (280x280, borde 6px, countdown en 64px)
- Controles: Skip Back, Pause/Play, Skip Forward
- Dots de progreso (1 por sesión) + label "Sesión X de N · Jornada: Xh Xm restantes"

### 3. Config Modal (480px)
- Campos: Duración jornada (con presets 2h/4h/6h/8h), Focus Time, Short Break, Long Break, Long Break cada N sesiones
- Resumen calculado en tiempo real (sesiones, breaks, tiempo total de foco)

---

## Fases de implementación

### Fase 1: Fundación (Tipos + Utils + Constantes + Ruta)

**Archivos a modificar:**
- `lib/types.ts` — Añadir tipos Pomodoro
- `lib/constants.ts` — Añadir constantes y STORAGE_KEYS

**Archivos a crear:**
- `lib/pomodoro-utils.ts` — Funciones puras de cálculo
- `app/pomodoro/page.tsx` — Página con skeleton

**Navegación (modificar):**
- `components/layout/NavItem.tsx` — Añadir icono `timer` de lucide-react
- `components/layout/Sidebar.tsx` — Añadir NavItem "Pomodoro" con `href="/pomodoro"` entre Calendario y Ajustes

#### Tipos nuevos (`lib/types.ts`)

```typescript
export type PomodoroSessionType = 'focus' | 'short_break' | 'long_break';
export type PomodoroPhase = 'setup' | 'active' | 'completed';

export interface PomodoroConfig {
  totalDurationMinutes: number;  // ej: 240 = 4h
  focusMinutes: number;          // ej: 25
  shortBreakMinutes: number;     // ej: 5
  longBreakMinutes: number;      // ej: 15
  longBreakInterval: number;     // ej: 4 (long break cada N focus)
}

export interface PomodoroSession {
  index: number;
  type: PomodoroSessionType;
  durationMinutes: number;
  taskId: string | null;
  label: string;                 // "Focus #1", "Short Break", "Long Break"
}

export interface PomodoroState {
  phase: PomodoroPhase;
  config: PomodoroConfig;
  sessions: PomodoroSession[];
  taskIds: string[];
  currentSessionIndex: number;
  timeRemainingSeconds: number;
  isPaused: boolean;
  startedAt: string | null;
}
```

#### Constantes nuevas (`lib/constants.ts`)

- `POMODORO_DEFAULTS`: config por defecto (4h, 25min focus, 5min short, 15min long, cada 4)
- `POMODORO_DURATION_OPTIONS`: [2h, 4h, 6h, 8h]
- `POMODORO_FOCUS_OPTIONS`: [15, 20, 25, 30, 45, 50 min]
- `POMODORO_SHORT_BREAK_OPTIONS`: [3, 5, 10 min]
- `POMODORO_LONG_BREAK_OPTIONS`: [10, 15, 20, 30 min]
- `POMODORO_INTERVAL_OPTIONS`: [2, 3, 4, 5 sesiones]
- `STORAGE_KEYS.POMODORO_CONFIG`: `'task-it-pomodoro-config'`
- `STORAGE_KEYS.POMODORO_STATE`: `'task-it-pomodoro-state'`

#### Funciones puras (`lib/pomodoro-utils.ts`)

- `generateSessionPlan(config)` — Genera array de sesiones que caben en la jornada
- `calculatePlanSummary(sessions)` — Cuenta focus/short/long y tiempo total
- `formatMinutesAsHoursMinutes(minutes)` — ej: 200 -> "3h 20m"
- `formatSecondsAsTimer(seconds)` — ej: 1122 -> "18:42"
- `distributeTasksToSessions(sessions, taskIds)` — Asigna tareas round-robin a sesiones focus

---

### Fase 2: Hook `usePomodoro`

**Archivo a crear:** `hooks/usePomodoro.ts`

Sigue el patrón de `useTasks.ts`: `useLocalStorage` para persistencia, `useCallback`/`useMemo` para estabilidad referencial.

**API del hook:**
```typescript
const {
  // Estado
  config,                    // PomodoroConfig
  phase,                     // 'setup' | 'active' | 'completed'
  sessions,                  // PomodoroSession[]
  taskIds,                   // string[]
  currentSessionIndex,       // number
  currentSession,            // PomodoroSession | null
  timeRemainingSeconds,      // number
  isPaused,                  // boolean

  // Derivados
  planSummary,               // { focusCount, shortBreakCount, longBreakCount, totalFocusMinutes }

  // Acciones config
  updateConfig,              // (config: PomodoroConfig) => void

  // Acciones setup
  setTaskIds,                // (ids: string[]) => void
  addTaskId,                 // (id: string) => void
  removeTaskId,              // (id: string) => void

  // Acciones sesión
  startJornada,              // () => void
  pauseTimer,                // () => void
  resumeTimer,               // () => void
  skipSession,               // () => void
  skipBackSession,           // () => void
  stopJornada,               // () => void
} = usePomodoro();
```

**Timer**: `useRef` para interval de 1s. `useEffect` controla start/stop según `phase === 'active' && !isPaused`. Al llegar a 0, auto-avanza a siguiente sesión o completa la jornada.

**Persistencia MVP**: Al recargar la página, resume desde `timeRemainingSeconds` guardado (sin calcular tiempo real transcurrido).

---

### Fase 3: Pantalla Setup

**Archivos a crear:**
- `components/pomodoro/index.ts` — Barrel exports
- `components/pomodoro/PomodoroView.tsx` — Orquestador (usa `usePomodoro` + `useTasks` + `useTags`)
- `components/pomodoro/PomodoroHeader.tsx` — Título + subtítulo + botones
- `components/pomodoro/PomodoroStats.tsx` — 4 stat cards (grid-cols-2 lg:grid-cols-4)
- `components/pomodoro/PomodoroTaskList.tsx` — Lista de tareas seleccionadas + botón "Añadir"
- `components/pomodoro/PomodoroSessionPlan.tsx` — Plan de sesiones generado (ancho 320px)

**Modificar:** `app/pomodoro/page.tsx` — Conectar `PomodoroView`

#### Stat cards (colores por card)
| Card | Icono lucide | Fondo icono | Color texto |
|------|-------------|-------------|-------------|
| Duración Jornada | `Clock` | `bg-primary/20` | `text-primary` |
| Focus Time | `Target` | `bg-emerald-500/20` | `text-emerald-500 dark:text-emerald-400` |
| Short/Long Break | `Coffee` | `bg-amber-500/20` | `text-amber-500 dark:text-amber-400` |
| Sesiones Totales | `BarChart3` | `bg-red-500/20` | `text-red-500 dark:text-red-400` |

#### Session plan (dots por tipo)
| Tipo | Color dot | Fondo item |
|------|-----------|------------|
| Focus | `bg-primary` | `bg-background` |
| Short Break | `bg-amber-500` | `bg-background` |
| Long Break | `bg-emerald-500` | `bg-emerald-500/10` |

---

### Fase 4: Pantalla Active Session

**Archivos a crear:**
- `components/pomodoro/ActiveSessionBar.tsx` — Badge sesión + nombre tarea + botón detener
- `components/pomodoro/TimerCircle.tsx` — Timer circular 280x280 con countdown
- `components/pomodoro/TimerControls.tsx` — SkipBack + Pause/Play + SkipForward
- `components/pomodoro/SessionProgress.tsx` — Dots de progreso + label

**Modificar:** `components/pomodoro/PomodoroView.tsx` — Añadir renderizado de fase activa

#### Timer circle (borde por tipo de sesión)
| Tipo | Color borde |
|------|-------------|
| Focus | `border-primary` |
| Short Break | `border-amber-500` |
| Long Break | `border-emerald-500` |

#### Controles
| Botón | Tamaño | Estilo | Icono |
|-------|--------|--------|-------|
| Skip Back | 48px | `bg-secondary` | `SkipBack` |
| Pause/Play | 64px | `bg-primary text-white` | `Pause` / `Play` |
| Skip Forward | 48px | `bg-secondary` | `SkipForward` |

---

### Fase 5: Config Modal

**Archivo a crear:** `components/pomodoro/PomodoroConfigModal.tsx`

**Modificar:** `components/pomodoro/PomodoroView.tsx` — Estado del modal + botón "Configurar"

- Usa el componente `Modal` existente (`components/ui/Modal.tsx`)
- Usa `Select` existente para los dropdowns
- Presets de duración como chips clickeables (2h, 4h, 6h, 8h)
- Resumen calculado en vivo usando `generateSessionPlan` + `calculatePlanSummary`
- Formulario con estado local, persiste al hacer "Guardar"

---

## Resumen de archivos

### Crear (14 archivos)
| Archivo | Fase |
|---------|------|
| `lib/pomodoro-utils.ts` | 1 |
| `app/pomodoro/page.tsx` | 1 |
| `hooks/usePomodoro.ts` | 2 |
| `components/pomodoro/index.ts` | 3 |
| `components/pomodoro/PomodoroView.tsx` | 3 |
| `components/pomodoro/PomodoroHeader.tsx` | 3 |
| `components/pomodoro/PomodoroStats.tsx` | 3 |
| `components/pomodoro/PomodoroTaskList.tsx` | 3 |
| `components/pomodoro/PomodoroSessionPlan.tsx` | 3 |
| `components/pomodoro/ActiveSessionBar.tsx` | 4 |
| `components/pomodoro/TimerCircle.tsx` | 4 |
| `components/pomodoro/TimerControls.tsx` | 4 |
| `components/pomodoro/SessionProgress.tsx` | 4 |
| `components/pomodoro/PomodoroConfigModal.tsx` | 5 |

### Modificar (4 archivos)
| Archivo | Cambio |
|---------|--------|
| `lib/types.ts` | Añadir tipos Pomodoro |
| `lib/constants.ts` | Añadir constantes + STORAGE_KEYS |
| `components/layout/NavItem.tsx` | Añadir icono `Timer` |
| `components/layout/Sidebar.tsx` | Añadir NavItem Pomodoro |

## Fuera de scope (MVP)
- Sin sonido/notificación al terminar sesión
- Sin notificaciones del navegador
- Sin historial de sesiones/analytics
- Sin drag-and-drop en plan de sesiones
- Sin crear tareas desde la vista Pomodoro
- Sin completar tareas desde el timer

## Verificación

```bash
npm run build   # Sin errores
npm run lint    # Sin warnings
npm run dev     # Test manual:
```

1. Navegar a `/pomodoro` desde sidebar (item activo)
2. Ver 4 stat cards con valores por defecto
3. Abrir modal "Configurar", cambiar valores, ver resumen en vivo, guardar
4. Añadir tareas a la jornada
5. Ver plan de sesiones con tareas asignadas
6. "Iniciar Jornada" -> transición a timer activo
7. Timer cuenta atrás, pause/resume funciona
8. Skip forward/back cambia de sesión
9. Borde del timer cambia de color según tipo (focus/break)
10. Dots de progreso se actualizan
11. "Detener Jornada" vuelve al setup
12. Dark mode funciona en todas las vistas
13. Responsive en mobile (stats 2 cols, columnas apiladas)
14. Estado persiste al recargar página
