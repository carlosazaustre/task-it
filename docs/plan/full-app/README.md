# Plan: Task-It Full-Stack Application

## Documentos

| # | Documento | Descripción |
|---|-----------|-------------|
| 00 | [PRD](./00-PRD.md) | Product Requirements Document - Visión general, stack, modelo de datos, fases |
| 01 | [Infraestructura](./01-SPEC-infrastructure.md) | Fase 0: PostgreSQL, Prisma, Zod, schema de DB |
| 02 | [Autenticación](./02-SPEC-authentication.md) | Fase 1: Auth.js, login/register, middleware, sesiones |
| 03 | [API Core](./03-SPEC-api-core.md) | Fase 2: CRUD de Tasks y Tags, endpoints REST |
| 04 | [Migración Frontend](./04-SPEC-frontend-migration.md) | Fase 3: Reemplazar localStorage por API calls |
| 05 | [API Extendida](./05-SPEC-api-extended.md) | Fase 4: Settings, Pomodoro, Analytics endpoints |
| 06 | [MCP Server](./06-SPEC-mcp-server.md) | Fase 5: Model Context Protocol para agentes IA |
| 07 | [Testing y Producción](./07-SPEC-testing-production.md) | Fase 6: Vitest, seguridad, deployment |
| 08 | [Task Tracker](./08-TASK-TRACKER.md) | Vista unificada de las 57 tareas con dependencias |

## Diagrama de Dependencias

```
Fase 0 (Infra) ──► Fase 1 (Auth) ──► Fase 2 (API Core) ─┬─► Fase 3 (Frontend Migration)
                                                           ├─► Fase 4 (API Extended)
                                                           └─► Fase 5 (MCP Server)
                                                                       │
                                                    Fase 6 (Testing) ◄─┘
```

## Quick Stats

- **Total de tareas**: 57
- **Tareas bloqueantes**: 27
- **Fases**: 7 (0 a 6)
- **Fases paralelizables**: 3, 4, 5 (simultáneas)
