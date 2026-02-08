# Pomodoro - Grafo de dependencias

## Diagrama de dependencias

```
┌─────────────────────────────────────────────────────────┐
│                    FASE 1 (Fundación)                   │
│                                                         │
│  ┌──────────┐                                           │
│  │ 01-types │ ◄── sin dependencias                      │
│  └────┬─────┘                                           │
│       │                                                 │
│       ▼                                                 │
│  ┌────────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │02-constants│  │ 03-utils │  │ 04-navigation    │    │
│  └────────────┘  └──────────┘  │ (sin deps pomod.)│    │
│       │               │        └──────────────────┘    │
│       │               │        ┌──────────────────┐    │
│       │               │        │ 05-route-skeleton │    │
│       │               │        │ (sin deps pomod.)│    │
│       │               │        └──────────────────┘    │
└───────┼───────────────┼────────────────────────────────┘
        │               │
        ▼               ▼
┌─────────────────────────────────────────────────────────┐
│                     FASE 2 (Lógica)                     │
│                                                         │
│  ┌────────────────────────┐                             │
│  │ 06-hook-usePomodoro    │                             │
│  │ (necesita 01, 02, 03)  │                             │
│  └───────────┬────────────┘                             │
└──────────────┼──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│          FASE 3, 4, 5 (UI) — EN PARALELO               │
│                                                         │
│  ┌────────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │07-setup-screen │ │08-active-    │ │09-config-    │  │
│  │(necesita 06)   │ │session       │ │modal         │  │
│  │                │ │(necesita 06) │ │(necesita 06) │  │
│  └───────┬────────┘ └──────┬───────┘ └──────┬───────┘  │
└──────────┼─────────────────┼────────────────┼───────────┘
           │                 │                │
           ▼                 ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                 FASE 6 (Integración)                    │
│                                                         │
│  ┌──────────────────────────────────┐                   │
│  │ 10-orchestrator (PomodoroView)   │                   │
│  │ (necesita 07, 08, 09)            │                   │
│  └──────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

## Resumen de paralelismo

| Grupo | Specs | Se puede paralelizar |
|-------|-------|---------------------|
| **A** | `01-types` | Ejecutar primero (sin deps) |
| **B** | `02-constants`, `03-utils`, `04-navigation`, `05-route-skeleton` | Todos en paralelo (solo dependen de 01) |
| **C** | `06-hook` | Ejecutar solo (depende de A + B) |
| **D** | `07-setup-screen`, `08-active-session`, `09-config-modal` | Todos en paralelo (solo dependen de C) |
| **E** | `10-orchestrator` | Ejecutar último (depende de todo D) |

## Orden de ejecución óptimo

```
Paso 1:  01-types
Paso 2:  02-constants ║ 03-utils ║ 04-navigation ║ 05-route-skeleton
Paso 3:  06-hook-usePomodoro
Paso 4:  07-setup-screen ║ 08-active-session ║ 09-config-modal
Paso 5:  10-orchestrator
```

**Total: 5 pasos secuenciales** (en lugar de 10 si fuera todo secuencial)
