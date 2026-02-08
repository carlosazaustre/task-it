# Settings - Grafo de dependencias

## Diagrama de dependencias

```
┌─────────────────────────────────────────────────────────────┐
│                    FASE 1 (Fundación)                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ 01-types     │  │ 02-constants │  │ 03-navigation    │  │
│  │ (sin deps)   │  │ (depende 01) │  │ (sin deps sett.) │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │
│         │                 │          ┌──────────────────┐   │
│         │                 │          │ 04-route-skeleton│   │
│         │                 │          │ (sin deps sett.) │   │
│         │                 │          └──────────────────┘   │
└─────────┼─────────────────┼─────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    FASE 2 (Lógica)                          │
│                                                             │
│  ┌─────────────────────────┐                                │
│  │ 05-hook-useSettings     │                                │
│  │ (necesita 01, 02)       │                                │
│  └────────────┬────────────┘                                │
└───────────────┼─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│           FASE 3 (UI Secciones) — EN PARALELO               │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │06-section-   │ │07-section-   │ │08-section-   │        │
│  │profile       │ │appearance    │ │pomodoro      │        │
│  │(necesita 05) │ │(necesita 05) │ │(necesita 05) │        │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘        │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │09-section-   │ │10-section-   │ │11-section-   │        │
│  │notifications │ │tags          │ │data          │        │
│  │(necesita 05) │ │(necesita 05) │ │(necesita 05) │        │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘        │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                 FASE 4 (Integración)                        │
│                                                             │
│  ┌───────────────────────────────────────┐                  │
│  │ 12-orchestrator (SettingsView)        │                  │
│  │ (necesita 06, 07, 08, 09, 10, 11)    │                  │
│  └───────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Resumen de paralelismo

| Grupo | Specs | Se puede paralelizar |
|-------|-------|---------------------|
| **A** | `01-types` | Ejecutar primero (sin deps) |
| **B** | `02-constants`, `03-navigation`, `04-route-skeleton` | Todos en paralelo (solo dependen de 01) |
| **C** | `05-hook-useSettings` | Ejecutar solo (depende de A + B) |
| **D** | `06-profile`, `07-appearance`, `08-pomodoro`, `09-notifications`, `10-tags`, `11-data` | Todos en paralelo (solo dependen de C) |
| **E** | `12-orchestrator` | Ejecutar último (depende de todo D) |

## Orden de ejecucion optimo

```
Paso 1:  01-types
Paso 2:  02-constants ║ 03-navigation ║ 04-route-skeleton
Paso 3:  05-hook-useSettings
Paso 4:  06-profile ║ 07-appearance ║ 08-pomodoro ║ 09-notifications ║ 10-tags ║ 11-data
Paso 5:  12-orchestrator
```

**Total: 5 pasos secuenciales** (en lugar de 12 si fuera todo secuencial)
