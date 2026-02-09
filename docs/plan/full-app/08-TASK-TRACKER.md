# Task Tracker: Full-Stack Migration

Este documento es la vista unificada de todas las tareas con sus dependencias y estado de ejecución. Usar como referencia principal para tracking del progreso.

## Leyenda

- 🔴 **BLOCKER**: Bloquea a otras tareas
- 🟡 **Parallelizable**: Puede ejecutarse en paralelo con otras
- ⬜ Pendiente | 🔄 En progreso | ✅ Completado

---

## Fase 0: Infraestructura y Base de Datos

| ID | Tarea | Estado | Bloquea | Bloqueado por | Paralelo con |
|----|-------|--------|---------|---------------|-------------|
| T0.1 | Instalar dependencias backend | ⬜ | T0.3, T0.6 | - | T0.2 |
| T0.2 | Configurar PostgreSQL local | ⬜ | T0.3 | - | T0.1 |
| T0.3 | Inicializar Prisma + schema | ⬜ | T0.4 | T0.1, T0.2 | - |
| T0.4 | Ejecutar primera migración | ⬜ | T0.5, T0.7, Fase 1 | T0.3 | - |
| T0.5 | Crear singleton Prisma client | ⬜ | Fase 1 | T0.4 | - |
| T0.6 | Crear schemas Zod | ⬜ | - | T0.1 | T0.4, T0.5 |
| T0.7 | Crear seed de datos | ⬜ | - | T0.4 | T0.5, T0.6 |

**Camino crítico**: T0.1 + T0.2 → T0.3 → T0.4 → T0.5

---

## Fase 1: Autenticación

| ID | Tarea | Estado | Bloquea | Bloqueado por | Paralelo con |
|----|-------|--------|---------|---------------|-------------|
| T1.1 | Instalar Auth.js | ⬜ | T1.2 | Fase 0 | - |
| T1.2 | Configurar Auth.js + Prisma | ⬜ | T1.3, T1.4, T1.10 | T1.1 | - |
| T1.3 | Route Handler Auth.js | ⬜ | T1.5 | T1.2 | T1.4 |
| T1.4 | API de registro | ⬜ | T1.7 | T1.2 | T1.3 |
| T1.5 | Middleware protección rutas | ⬜ | T1.6, T1.9 | T1.3 | - |
| T1.6 | Página de Login | ⬜ | Fase 2 | T1.5 | T1.7, T1.8 |
| T1.7 | Página de Registro | ⬜ | - | T1.4 | T1.6, T1.8 |
| T1.8 | Layout de autenticación | ⬜ | - | - | T1.6, T1.7 |
| T1.9 | Integrar sesión en layout | ⬜ | Fase 3 | T1.5 | T1.6 |
| T1.10 | Helper getAuthUser | ⬜ | Fase 2 | T1.2 | T1.3 - T1.9 |

**Camino crítico**: T1.1 → T1.2 → T1.3 → T1.5 → T1.6

---

## Fase 2: API Core (Tasks + Tags)

| ID | Tarea | Estado | Bloquea | Bloqueado por | Paralelo con |
|----|-------|--------|---------|---------------|-------------|
| T2.1 | Helper respuestas API | ⬜ | - | Fase 1 | T2.2 |
| T2.2 | GET /tasks (listar) | ⬜ | Fase 3 | Fase 1 | T2.1, T2.3, T2.7 |
| T2.3 | POST /tasks (crear) | ⬜ | Fase 3 | Fase 1 | T2.2, T2.4, T2.7 |
| T2.4 | GET /tasks/:id | ⬜ | - | Fase 1 | T2.2, T2.3, T2.5 |
| T2.5 | PATCH /tasks/:id | ⬜ | Fase 3 | Fase 1 | T2.4, T2.6 |
| T2.6 | DELETE /tasks/:id | ⬜ | - | Fase 1 | T2.5 |
| T2.7 | CRUD /tags (completo) | ⬜ | Fase 3 | Fase 1 | T2.2 - T2.6 |
| T2.8 | Mappers API ↔ Frontend | ⬜ | Fase 3 | Fase 1 | T2.2 - T2.7 |

**Camino crítico**: T2.2 + T2.3 + T2.5 + T2.7 (todos necesarios para Fase 3)

---

## Fase 3: Migración Frontend (🟡 Paralelizable con Fases 4, 5)

| ID | Tarea | Estado | Bloquea | Bloqueado por | Paralelo con |
|----|-------|--------|---------|---------------|-------------|
| T3.1 | Crear API client | ⬜ | T3.2 - T3.8 | Fase 2 | - |
| T3.2 | Migrar useTasks | ⬜ | T3.4, T3.9 | T3.1 | T3.3 |
| T3.3 | Migrar useTags | ⬜ | T3.4, T3.9 | T3.1 | T3.2 |
| T3.4 | Migrar useTaskFilters | ⬜ | T3.9 | T3.2 | T3.5, T3.6 |
| T3.5 | Añadir estados de error | ⬜ | - | T3.1 | T3.2 - T3.8 |
| T3.6 | Migrar useSettings | ⬜ | T3.9 | T3.1 | T3.2 - T3.5 |
| T3.7 | Actualizar useTheme | ⬜ | - | T3.1 | T3.2 - T3.6 |
| T3.8 | UserProfile con sesión | ⬜ | - | Fase 1 | T3.2 - T3.7 |
| T3.9 | Cleanup localStorage | ⬜ | Fase 6 | T3.2, T3.3, T3.6 | - |

**Camino crítico**: T3.1 → T3.2 + T3.3 → T3.4 → T3.9

---

## Fase 4: API Extendida (🟡 Paralelizable con Fases 3, 5)

| ID | Tarea | Estado | Bloquea | Bloqueado por | Paralelo con |
|----|-------|--------|---------|---------------|-------------|
| T4.1 | API Settings Profile | ⬜ | - | Fase 2 | T4.2, T4.3, T4.4 |
| T4.2 | API Settings General | ⬜ | - | Fase 2 | T4.1, T4.3, T4.4 |
| T4.3 | API Pomodoro Sessions | ⬜ | - | Fase 2 | T4.1, T4.2, T4.4 |
| T4.4 | API Analytics | ⬜ | - | Fase 2 | T4.1, T4.2, T4.3 |
| T4.5 | API Export/Import/Delete | ⬜ | - | Fase 2 | T4.1 - T4.4 |

**Nota**: Todas las tareas de esta fase son independientes entre sí.

---

## Fase 5: MCP Server (🟡 Paralelizable con Fases 3, 4)

| ID | Tarea | Estado | Bloquea | Bloqueado por | Paralelo con |
|----|-------|--------|---------|---------------|-------------|
| T5.1 | Migración ApiKey | ⬜ | T5.2, T5.3 | Fase 2 | - |
| T5.2 | API gestión API Keys | ⬜ | T5.8 | T5.1 | T5.3 |
| T5.3 | Middleware API Key auth | ⬜ | T5.4 | T5.1 | T5.2 |
| T5.4 | Crear MCP Server base | ⬜ | T5.5, T5.6, T5.7 | T5.3 | - |
| T5.5 | Tools de Tasks | ⬜ | Fase 6 | T5.4 | T5.6, T5.7 |
| T5.6 | Tools de Tags | ⬜ | - | T5.4 | T5.5, T5.7 |
| T5.7 | Resources MCP | ⬜ | - | T5.4 | T5.5, T5.6 |
| T5.8 | UI API Keys en Settings | ⬜ | - | T5.2 | T5.4 - T5.7 |
| T5.9 | Documentar MCP | ⬜ | - | T5.5, T5.6, T5.7 | T5.8 |

**Camino crítico**: T5.1 → T5.3 → T5.4 → T5.5

---

## Fase 6: Testing y Producción

| ID | Tarea | Estado | Bloquea | Bloqueado por | Paralelo con |
|----|-------|--------|---------|---------------|-------------|
| T6.1 | Configurar Vitest | ⬜ | T6.2 - T6.4 | - | Fases 3, 4, 5 |
| T6.2 | Tests API endpoints | ⬜ | - | T6.1, Fase 2 | T6.3, T6.4 |
| T6.3 | Tests hooks migrados | ⬜ | - | T6.1, Fase 3 | T6.2, T6.4 |
| T6.4 | Tests autenticación | ⬜ | - | T6.1, Fase 1 | T6.2, T6.3 |
| T6.5 | Test E2E MCP | ⬜ | - | Fase 5 | T6.2 - T6.4 |
| T6.6 | Variables entorno prod | ⬜ | T6.7 | - | T6.1 - T6.5 |
| T6.7 | Preparar deployment | ⬜ | - | T6.6 | T6.8, T6.9 |
| T6.8 | Seguridad y hardening | ⬜ | - | Fases 1, 2 | T6.2 - T6.7 |
| T6.9 | Documentación final | ⬜ | - | Fases 3, 4, 5 | T6.2 - T6.8 |

**Nota**: T6.1 puede empezar antes de que las fases anteriores terminen.

---

## Resumen de Ejecución Óptima

```
Semana 1: Fase 0 (completa) + inicio Fase 1
┌────────────────────────────────────────┐
│ T0.1+T0.2 → T0.3 → T0.4 → T0.5       │
│             T0.6        T0.7           │
│ T1.1 → T1.2 → T1.3+T1.4              │
└────────────────────────────────────────┘

Semana 2: Fase 1 (completa) + inicio Fase 2
┌────────────────────────────────────────┐
│ T1.5 → T1.6+T1.7+T1.8 → T1.9         │
│ T1.10                                   │
│ T2.1 + T2.8                            │
└────────────────────────────────────────┘

Semana 3: Fase 2 (completa) + inicio Fases 3, 4, 5
┌────────────────────────────────────────┐
│ T2.2+T2.3+T2.7 → T2.4+T2.5+T2.6      │
│ T3.1 (inicio)                           │
│ T5.1 (inicio)                           │
└────────────────────────────────────────┘

Semana 4-5: Fases 3, 4, 5 en paralelo
┌────────────────────────────────────────┐
│ [Fase 3] T3.2+T3.3 → T3.4 → T3.9     │
│ [Fase 4] T4.1+T4.2+T4.3+T4.4+T4.5    │
│ [Fase 5] T5.3 → T5.4 → T5.5+T5.6     │
│ [Fase 6] T6.1 (testing setup)          │
└────────────────────────────────────────┘

Semana 6: Fase 6 + pulido
┌────────────────────────────────────────┐
│ T6.2+T6.3+T6.4+T6.5                   │
│ T6.6 → T6.7 → T6.8                    │
│ T6.9 (documentación)                   │
└────────────────────────────────────────┘
```

## Conteo Total

| Fase | Tareas | Bloqueantes |
|------|--------|-------------|
| Fase 0 | 7 | 5 |
| Fase 1 | 10 | 7 |
| Fase 2 | 8 | 5 |
| Fase 3 | 9 | 4 |
| Fase 4 | 5 | 0 |
| Fase 5 | 9 | 4 |
| Fase 6 | 9 | 2 |
| **Total** | **57** | **27** |
