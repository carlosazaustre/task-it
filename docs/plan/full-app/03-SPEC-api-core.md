# Fase 2: API Core (Tasks + Tags)

> **Estado**: Pendiente
> **Bloquea**: Fase 3, 4, 5
> **Bloqueado por**: Fase 0 + Fase 1
> **Paralelizable**: No (es base para frontend y MCP)

## Objetivo

Crear los endpoints REST API para las operaciones CRUD de tareas y tags, con autenticación, validación y manejo de errores. Estos endpoints serán consumidos tanto por el frontend como por el MCP server.

## Convenciones de la API

### Base URL
```
/api/v1/
```

### Formato de respuesta
```typescript
// Éxito
{ data: T }

// Éxito con paginación
{ data: T[], pagination: { page, limit, total, totalPages } }

// Error
{ error: string, details?: object }
```

### Códigos HTTP
| Código | Uso |
|--------|-----|
| 200 | OK (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validación) |
| 401 | Unauthorized (sin sesión) |
| 404 | Not Found |
| 409 | Conflict (duplicado) |
| 500 | Internal Server Error |

### Headers
```
Content-Type: application/json
Authorization: via cookie de sesión (automático con Auth.js)
```

## Tareas

### T2.1: Crear helper de respuestas API
**Bloqueante**: No (conveniencia, no obligatorio)
**Paralelo con**: T2.2

Crear `lib/api-utils.ts`:

```typescript
import { NextResponse } from 'next/server'

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function apiError(error: string, status: number, details?: object) {
  return NextResponse.json({ error, ...(details && { details }) }, { status })
}

export function apiPaginated<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number }
) {
  return NextResponse.json({
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  })
}
```

---

### T2.2: API de Tasks - GET /api/v1/tasks (Listar)
**Bloqueante**: Sí
**Depende de**: Fase 0 + Fase 1

Crear `app/api/v1/tasks/route.ts`:

```
GET /api/v1/tasks
```

**Query params**:
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `page` | number | 1 | Página actual |
| `limit` | number | 50 | Items por página |
| `status` | string | - | Filtrar por status |
| `priority` | string | - | Filtrar por prioridad |
| `tags` | string | - | IDs de tags separados por coma |
| `search` | string | - | Búsqueda en title + description |
| `overdue` | boolean | false | Solo tareas vencidas |
| `sort` | string | `createdAt` | Campo de ordenamiento |
| `order` | string | `desc` | Dirección (asc/desc) |

**Respuesta**:
```json
{
  "data": [
    {
      "id": "clxyz...",
      "title": "Implementar API",
      "description": "...",
      "status": "pending",
      "priority": "high",
      "dueDate": "2026-02-15T00:00:00.000Z",
      "tags": [
        { "id": "clxyz...", "name": "Trabajo", "color": "blue" }
      ],
      "createdAt": "2026-02-09T10:00:00.000Z",
      "updatedAt": "2026-02-09T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "totalPages": 3
  }
}
```

**Implementación clave**:
```typescript
// Construir where clause dinámicamente
const where: Prisma.TaskWhereInput = {
  userId: user.id,
  ...(status && { status: statusMap[status] }),
  ...(priority && { priority: priorityMap[priority] }),
  ...(search && {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ],
  }),
  ...(overdue && { dueDate: { lt: new Date() }, status: { not: 'COMPLETED' } }),
  ...(tagIds.length > 0 && { tags: { some: { id: { in: tagIds } } } }),
}
```

---

### T2.3: API de Tasks - POST /api/v1/tasks (Crear)
**Bloqueante**: Sí
**Paralelo con**: T2.2

En el mismo archivo `app/api/v1/tasks/route.ts`:

```
POST /api/v1/tasks
```

**Body**:
```json
{
  "title": "Nueva tarea",
  "description": "Descripción opcional",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-02-15T00:00:00.000Z",
  "tagIds": ["clxyz..."]
}
```

**Respuesta**: `201 Created` con la tarea creada (incluyendo tags populados)

**Validación**: Usar `createTaskSchema` de Zod.

**Lógica**:
1. Validar input con Zod
2. Verificar que los tagIds pertenecen al usuario
3. Crear la tarea con `prisma.task.create()`
4. Devolver la tarea con tags incluidos

---

### T2.4: API de Tasks - GET /api/v1/tasks/:id (Obtener)
**Bloqueante**: No
**Paralelo con**: T2.2, T2.3

Crear `app/api/v1/tasks/[id]/route.ts`:

```
GET /api/v1/tasks/:id
```

**Respuesta**: La tarea con tags o `404` si no existe / no pertenece al usuario.

**Seguridad**: SIEMPRE filtrar por `userId` para evitar acceso a tareas de otros usuarios:
```typescript
const task = await prisma.task.findFirst({
  where: { id: params.id, userId: user.id },
  include: { tags: true },
})
```

---

### T2.5: API de Tasks - PATCH /api/v1/tasks/:id (Actualizar)
**Bloqueante**: Sí
**Paralelo con**: T2.4

En el mismo archivo `app/api/v1/tasks/[id]/route.ts`:

```
PATCH /api/v1/tasks/:id
```

**Body**: Cualquier subset de campos de la tarea:
```json
{
  "status": "completed",
  "tagIds": ["clxyz...", "clxyz2..."]
}
```

**Lógica para tags**:
```typescript
// Si se envían tagIds, reemplazar la relación completa
if (tagIds) {
  await prisma.task.update({
    where: { id: params.id },
    data: {
      ...otherFields,
      tags: {
        set: tagIds.map(id => ({ id })),
      },
    },
  })
}
```

---

### T2.6: API de Tasks - DELETE /api/v1/tasks/:id (Eliminar)
**Bloqueante**: No
**Paralelo con**: T2.5

En el mismo archivo `app/api/v1/tasks/[id]/route.ts`:

```
DELETE /api/v1/tasks/:id
```

**Respuesta**: `204 No Content`

**Seguridad**: Verificar que la tarea pertenece al usuario antes de eliminar.

---

### T2.7: API de Tags - CRUD completo
**Bloqueante**: Sí (necesario para crear tareas con tags)
**Paralelo con**: T2.2 - T2.6

Crear:
- `app/api/v1/tags/route.ts` (GET list, POST create)
- `app/api/v1/tags/[id]/route.ts` (GET one, PATCH update, DELETE)

#### GET /api/v1/tags
```json
{
  "data": [
    { "id": "...", "name": "Trabajo", "color": "blue", "createdAt": "..." }
  ]
}
```

#### POST /api/v1/tags
```json
// Request
{ "name": "Diseño", "color": "pink" }

// Response: 201
{ "data": { "id": "...", "name": "Diseño", "color": "pink" } }
```

**Validación**: Nombre único por usuario (constraint de DB + check explícito para mejor error message).

#### PATCH /api/v1/tags/:id
```json
{ "name": "Diseño UX", "color": "fuchsia" }
```

#### DELETE /api/v1/tags/:id
- Desvincula el tag de todas las tareas antes de eliminar
- Respuesta: `204 No Content`

---

### T2.8: Mapeo de enums entre API y frontend
**Bloqueante**: Sí
**Paralelo con**: T2.2

Crear `lib/api-mappers.ts`:

El frontend usa strings lowercase (`'pending'`, `'high'`) pero Prisma usa enums UPPERCASE (`PENDING`, `HIGH`). Necesitamos mappers bidireccionales:

```typescript
// API → Frontend
export function taskToApi(task: PrismaTask & { tags: PrismaTag[] }) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status.toLowerCase() as TaskStatus,
    priority: task.priority.toLowerCase() as TaskPriority,
    dueDate: task.dueDate?.toISOString() ?? null,
    tags: task.tags.map(tagToApi),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}

// Frontend → Prisma
export function statusToPrisma(status: string): TaskStatus {
  return status.toUpperCase() as TaskStatus
}
```

---

## Estructura de archivos resultante

```
app/
└── api/
    └── v1/
        ├── tasks/
        │   ├── route.ts           # GET (list) + POST (create)
        │   └── [id]/
        │       └── route.ts       # GET (one) + PATCH (update) + DELETE
        └── tags/
            ├── route.ts           # GET (list) + POST (create)
            └── [id]/
                └── route.ts       # GET (one) + PATCH (update) + DELETE

lib/
├── api-utils.ts                   # Response helpers
├── api-mappers.ts                 # Enum/format mappers
└── validations/
    ├── task.ts                    # Task schemas
    └── tag.ts                     # Tag schemas
```

## Resumen de Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | Listar tareas (con filtros y paginación) |
| POST | `/api/v1/tasks` | Crear tarea |
| GET | `/api/v1/tasks/:id` | Obtener tarea por ID |
| PATCH | `/api/v1/tasks/:id` | Actualizar tarea |
| DELETE | `/api/v1/tasks/:id` | Eliminar tarea |
| GET | `/api/v1/tags` | Listar tags del usuario |
| POST | `/api/v1/tags` | Crear tag |
| GET | `/api/v1/tags/:id` | Obtener tag por ID |
| PATCH | `/api/v1/tags/:id` | Actualizar tag |
| DELETE | `/api/v1/tags/:id` | Eliminar tag |

## Criterios de Aceptación

- [ ] Todos los endpoints devuelven JSON con formato consistente
- [ ] Todas las operaciones filtran por `userId` (aislamiento de datos)
- [ ] Validación con Zod en todos los POST/PATCH
- [ ] Códigos HTTP correctos en todos los escenarios
- [ ] Búsqueda case-insensitive funciona
- [ ] Filtros múltiples se combinan con AND
- [ ] Paginación funciona correctamente
- [ ] Tags se populan en las respuestas de tasks
- [ ] Un usuario NO puede acceder a tareas/tags de otro usuario
- [ ] Delete de tag desvincula de tareas asociadas
- [ ] `npm run build` compila sin errores
- [ ] Endpoints probados con curl/Postman/httpie
