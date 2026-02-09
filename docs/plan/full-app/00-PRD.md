# PRD: Task-It Full-Stack Application

## Resumen Ejecutivo

Transformar Task-It de una aplicación frontend-only con persistencia en localStorage a una **aplicación full-stack completa** con backend API REST, base de datos, autenticación de usuarios, y capacidad de integración con agentes IA vía MCP (Model Context Protocol).

Cada usuario tendrá su propio espacio aislado: panel de tareas, calendario, pomodoro, analytics y configuración.

## Visión del Producto

```
┌─────────────────────────────────────────────────────────┐
│                    TASK-IT ECOSYSTEM                      │
│                                                           │
│  ┌──────────┐   ┌─────────────┐   ┌──────────────────┐  │
│  │ Frontend  │◄─►│  REST API   │◄─►│   PostgreSQL     │  │
│  │ (Next.js) │   │  (Next.js   │   │   (Database)     │  │
│  │           │   │   Routes)   │   │                  │  │
│  └──────────┘   └──────┬──────┘   └──────────────────┘  │
│                         │                                 │
│                    ┌────┴────┐                            │
│                    │   MCP   │                            │
│                    │ Server  │                            │
│                    └────┬────┘                            │
│                         │                                 │
│              ┌──────────┴──────────┐                     │
│              │  Claude / CLI       │                     │
│              │  Agent Integration  │                     │
│              └─────────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## Stack Técnico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Frontend** | Next.js 16 + React 19 | Ya existente, App Router |
| **Backend** | Next.js Route Handlers | Mismo proyecto, zero-config API |
| **Base de datos** | PostgreSQL | Relacional, robusto, JSON support |
| **ORM** | Prisma | Type-safe, migraciones, gran DX con TS |
| **Autenticación** | Auth.js v5 (NextAuth) | SSR-ready, múltiples providers |
| **Validación** | Zod | Runtime validation, infiere tipos TS |
| **MCP** | @modelcontextprotocol/sdk | Protocolo estándar para agentes IA |

## Usuarios Objetivo

1. **Usuario Web**: Accede via navegador, gestiona tareas con la UI existente
2. **Usuario CLI/Agente**: Interactúa via MCP para crear/gestionar tareas desde Claude Code u otros agentes

## Requisitos Funcionales

### RF-01: Autenticación y Gestión de Usuarios
- Registro con email + contraseña
- Login / Logout
- Sesiones persistentes (JWT via cookies)
- Protección de rutas (middleware)

### RF-02: API REST - Tareas
- CRUD completo de tareas por usuario
- Filtros: status, priority, tags, búsqueda, overdue
- Ordenamiento y paginación
- Validación de datos de entrada

### RF-03: API REST - Tags
- CRUD de tags por usuario
- Validación de unicidad de nombre por usuario
- Tags predeterminados al registrarse

### RF-04: API REST - Configuración de Usuario
- Perfil (nombre, email, role, idioma)
- Preferencias de notificación
- Configuración de Pomodoro
- Preferencias de apariencia (tema)

### RF-05: API REST - Pomodoro
- Persistir sesiones de Pomodoro completadas
- Historial de sesiones por usuario
- Estadísticas de focus time acumulado

### RF-06: API REST - Analytics
- KPIs calculados en servidor
- Actividad semanal
- Distribución por tags
- Actividad reciente

### RF-07: Migración del Frontend
- Reemplazar localStorage por llamadas API
- Estados de carga, error y retry
- Actualizaciones optimistas en UI
- Sesión de usuario en toda la app

### RF-08: MCP Server
- Tool: crear tarea
- Tool: listar tareas (con filtros)
- Tool: actualizar tarea (status, priority)
- Tool: eliminar tarea
- Tool: listar tags
- Resource: resumen del usuario (tareas pendientes, stats)

## Requisitos No Funcionales

- **Rendimiento**: API responses < 200ms para operaciones CRUD
- **Seguridad**: Passwords hasheados con bcrypt, CSRF protection, input sanitization
- **Escalabilidad**: Schema diseñado para multi-tenant desde el inicio
- **Disponibilidad**: Graceful degradation si el backend falla
- **Compatibilidad**: Mantener la UX actual intacta durante la migración

## Fases de Implementación

| Fase | Nombre | Dependencias | Parallelizable |
|------|--------|-------------|----------------|
| **0** | [Infraestructura y DB](./01-SPEC-infrastructure.md) | Ninguna | Base, BLOQUEANTE |
| **1** | [Autenticación](./02-SPEC-authentication.md) | Fase 0 | BLOQUEANTE |
| **2** | [API Core (Tasks + Tags)](./03-SPEC-api-core.md) | Fase 0 + 1 | BLOQUEANTE |
| **3** | [Migración Frontend](./04-SPEC-frontend-migration.md) | Fase 2 | Con Fase 4 |
| **4** | [API Extendida](./05-SPEC-api-extended.md) | Fase 2 | Con Fase 3 y 5 |
| **5** | [MCP Server](./06-SPEC-mcp-server.md) | Fase 2 | Con Fase 3 y 4 |
| **6** | [Testing y Producción](./07-SPEC-testing-production.md) | Fases 3, 4, 5 | Final |

## Diagrama de Dependencias

```
Fase 0 (Infraestructura)
  │
  ▼
Fase 1 (Auth) ─────────────────────────────────┐
  │                                              │
  ▼                                              │
Fase 2 (API Core) ──────────────────────────────┤
  │                                              │
  ├──────────────┬──────────────┐                │
  ▼              ▼              ▼                │
Fase 3        Fase 4        Fase 5              │
(Frontend     (API           (MCP               │
 Migration)   Extended)      Server)            │
  │              │              │                │
  └──────────────┴──────────────┘                │
                 │                               │
                 ▼                               │
            Fase 6 (Testing + Production) ◄──────┘
```

## Modelo de Datos (Resumen)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────<│   Task   │>────│   Tag    │
│          │     │          │     │          │
│ id       │     │ id       │     │ id       │
│ email    │     │ title    │     │ name     │
│ name     │     │ status   │     │ color    │
│ password │     │ priority │     │ userId   │
│ ...      │     │ dueDate  │     └──────────┘
└──────────┘     │ userId   │
      │          └──────────┘
      │
      ├────<┌──────────────────┐
      │     │ PomodoroSession  │
      │     │                  │
      │     │ id               │
      │     │ startedAt        │
      │     │ completedAt      │
      │     │ focusMinutes     │
      │     │ userId           │
      │     └──────────────────┘
      │
      └────<┌──────────────────┐
            │  UserSettings    │
            │                  │
            │ id               │
            │ theme            │
            │ pomodoroConfig   │
            │ notifications    │
            │ userId           │
            └──────────────────┘
```

## Métricas de Éxito

1. **Funcional**: Un usuario puede registrarse, crear tareas, y verlas en su panel personalizado
2. **Multi-usuario**: Dos usuarios distintos ven datos completamente aislados
3. **MCP**: Desde Claude Code se puede crear una tarea que aparece en la UI web
4. **Migración**: La UI se comporta idénticamente al estado actual (zero regression)
5. **Rendimiento**: Tiempos de respuesta API < 200ms en operaciones CRUD

## Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Migración rompe UX existente | Alto | Feature flags, rollback path, pruebas E2E |
| Complejidad de auth | Medio | Auth.js maneja la mayoría de la complejidad |
| Schema changes en producción | Alto | Prisma migrations con revisión manual |
| Performance con queries complejas | Medio | Índices en DB, paginación desde el inicio |
| MCP protocol changes | Bajo | SDK oficial de Anthropic, versionado |
