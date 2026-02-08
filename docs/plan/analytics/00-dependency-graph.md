# Analytics - Grafo de dependencias

## Diagrama de dependencias

```
┌──────────────────────────────────────────────────────────────┐
│                    FASE 1 (Fundación)                        │
│                                                              │
│  ┌──────────┐  ┌──────────────┐                              │
│  │ 01-types │  │ 02-constants │                              │
│  │ (sin dep)│  │ (necesita 01)│                              │
│  └────┬─────┘  └──────┬───────┘                              │
│       │               │                                      │
│       │  ┌────────────────────┐  ┌──────────────────┐        │
│       │  │ 03-navigation      │  │ 04-route-skeleton│        │
│       │  │ (sin deps analytics)│  │ (sin deps)       │        │
│       │  └────────────────────┘  └──────────────────┘        │
└───────┼───────────────┼──────────────────────────────────────┘
        │               │
        ▼               ▼
┌──────────────────────────────────────────────────────────────┐
│                     FASE 2 (Lógica)                          │
│                                                              │
│  ┌────────────────────────────────────┐                      │
│  │ 05-analytics-utils                 │                      │
│  │ (necesita 01, 02)                  │                      │
│  └──────────────────┬─────────────────┘                      │
│                     │                                        │
│  ┌────────────────────────────────────┐                      │
│  │ 06-hook-useAnalytics              │                      │
│  │ (necesita 01, 02, 05)             │                      │
│  └──────────────────┬─────────────────┘                      │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│              FASE 3 (Componentes UI) — EN PARALELO           │
│                                                              │
│  ┌──────────────────┐ ┌──────────────────┐                   │
│  │ 07-analytics-    │ │ 08-kpi-cards     │                   │
│  │ header           │ │ (necesita 06)    │                   │
│  │ (necesita 06)    │ └──────────────────┘                   │
│  └──────────────────┘                                        │
│  ┌──────────────────┐ ┌──────────────────┐                   │
│  │ 09-weekly-chart  │ │ 10-tag-          │                   │
│  │ (necesita 06)    │ │ distribution     │                   │
│  └──────────────────┘ │ (necesita 06)    │                   │
│                       └──────────────────┘                   │
│  ┌──────────────────┐                                        │
│  │ 11-recent-       │                                        │
│  │ activity         │                                        │
│  │ (necesita 06)    │                                        │
│  └──────────────────┘                                        │
└──────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                FASE 4 (Integración)                          │
│                                                              │
│  ┌──────────────────────────────────────┐                    │
│  │ 12-orchestrator (AnalyticsView)      │                    │
│  │ (necesita 07, 08, 09, 10, 11)       │                    │
│  └──────────────────────────────────────┘                    │
└──────────────────────────────────────────────────────────────┘
```

## Resumen de paralelismo

| Grupo | Specs | Se puede paralelizar |
|-------|-------|---------------------|
| **A** | `01-types` | Ejecutar primero (sin deps) |
| **B** | `02-constants`, `03-navigation`, `04-route-skeleton` | Todos en paralelo (02 depende de 01; 03 y 04 sin deps) |
| **C** | `05-analytics-utils` | Ejecutar solo (depende de A + B) |
| **D** | `06-hook-useAnalytics` | Ejecutar solo (depende de C) |
| **E** | `07-header`, `08-kpi-cards`, `09-weekly-chart`, `10-tag-distribution`, `11-recent-activity` | Todos en paralelo (dependen de D) |
| **F** | `12-orchestrator` | Ejecutar último (depende de todo E) |

## Orden de ejecución óptimo

```
Paso 1:  01-types
Paso 2:  02-constants ║ 03-navigation ║ 04-route-skeleton
Paso 3:  05-analytics-utils
Paso 4:  06-hook-useAnalytics
Paso 5:  07-header ║ 08-kpi-cards ║ 09-weekly-chart ║ 10-tag-distribution ║ 11-recent-activity
Paso 6:  12-orchestrator
```

**Total: 6 pasos secuenciales** (en lugar de 12 si fuera todo secuencial)
