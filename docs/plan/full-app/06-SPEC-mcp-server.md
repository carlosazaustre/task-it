# Fase 5: MCP Server

> **Estado**: Pendiente
> **Bloquea**: Fase 6
> **Bloqueado por**: Fase 2 (API Core)
> **Paralelizable**: Sí, con Fase 3 y Fase 4

## Objetivo

Crear un servidor MCP (Model Context Protocol) que permita a agentes IA (Claude Code, Claude Desktop, CLI personalizado) interactuar con Task-It para crear, listar, actualizar y eliminar tareas programáticamente.

## Qué es MCP

MCP (Model Context Protocol) es un protocolo abierto de Anthropic que estandariza cómo los modelos de IA se comunican con sistemas externos. Un MCP Server expone **tools** (acciones) y **resources** (datos) que un agente puede usar.

```
┌──────────────┐      MCP Protocol      ┌──────────────┐
│  Claude Code │ ◄──────────────────────► │  Task-It     │
│  (MCP Client)│    JSON-RPC over stdio  │  MCP Server  │
└──────────────┘                          └──────┬───────┘
                                                  │
                                           ┌──────┴───────┐
                                           │  Task-It API │
                                           │  (internal)  │
                                           └──────────────┘
```

## Stack

- `@modelcontextprotocol/sdk`: SDK oficial de MCP
- Comunicación via **stdio** (stdin/stdout)
- Autenticación via **API key** por usuario

## Diseño

### Autenticación MCP

El MCP server necesita autenticarse como un usuario específico. Opciones:

**Opción elegida: API Keys por usuario**

Añadir tabla `ApiKey` al schema:

```prisma
model ApiKey {
  id        String   @id @default(cuid())
  key       String   @unique  // Prefixed: "tk_" + random
  name      String             // "Claude Code", "CLI", etc.
  lastUsed  DateTime?
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([key])
  @@map("api_keys")
}
```

El usuario genera API keys desde Settings. El MCP server recibe la key via variable de entorno o argumento.

### Configuración del MCP en Claude Code

El usuario añade a su `.claude/settings.json` o al `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "task-it": {
      "command": "node",
      "args": ["path/to/task-it/mcp-server/dist/index.js"],
      "env": {
        "TASKIT_API_KEY": "tk_xxxxxxxxxxxxx",
        "TASKIT_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Tareas

### T5.1: Crear migración para ApiKey
**Bloqueante**: Sí
**Paralelo**: No

1. Añadir modelo `ApiKey` al `prisma/schema.prisma`
2. Añadir relación en `User`: `apiKeys ApiKey[]`
3. Ejecutar `npx prisma migrate dev --name add-api-keys`

---

### T5.2: API de gestión de API Keys
**Bloqueante**: Sí
**Depende de**: T5.1

Crear endpoints para que el usuario gestione sus API keys desde Settings:

#### POST /api/v1/api-keys

Crear una nueva API key.

```json
// Request
{ "name": "Claude Code" }

// Response (201) - La key solo se muestra una vez
{
  "data": {
    "id": "...",
    "key": "tk_a1b2c3d4e5f6g7h8i9j0...",
    "name": "Claude Code",
    "createdAt": "..."
  }
}
```

**Generación de key**:
```typescript
import { randomBytes } from 'crypto'

function generateApiKey(): string {
  return 'tk_' + randomBytes(32).toString('hex')
}
```

#### GET /api/v1/api-keys

Listar API keys del usuario (sin mostrar la key completa).

```json
{
  "data": [
    {
      "id": "...",
      "name": "Claude Code",
      "keyPreview": "tk_a1b2...j0",
      "lastUsed": "2026-02-09T10:00:00.000Z",
      "createdAt": "..."
    }
  ]
}
```

#### DELETE /api/v1/api-keys/:id

Revocar una API key.

---

### T5.3: Middleware de autenticación por API Key
**Bloqueante**: Sí
**Depende de**: T5.1

Crear `lib/api-key-auth.ts`:

```typescript
import { prisma } from '@/lib/prisma'

export async function authenticateApiKey(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer tk_')) {
    return null
  }

  const key = authHeader.replace('Bearer ', '')

  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: { user: { select: { id: true, email: true, name: true } } },
  })

  if (!apiKey) return null

  // Actualizar lastUsed
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  })

  return apiKey.user
}
```

Actualizar `lib/auth-utils.ts` para soportar ambos métodos:
```typescript
export async function getAuthUser(request?: Request) {
  // 1. Intentar API Key (para MCP y API externa)
  if (request) {
    const apiKeyUser = await authenticateApiKey(request)
    if (apiKeyUser) return { user: apiKeyUser, errorResponse: null }
  }

  // 2. Intentar session (para frontend)
  const session = await auth()
  if (session?.user?.id) {
    return { user: session.user, errorResponse: null }
  }

  return {
    user: null,
    errorResponse: NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
}
```

---

### T5.4: Crear el MCP Server
**Bloqueante**: Sí
**Depende de**: T5.3

Crear `mcp-server/`:

```
mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts            # Entry point
│   ├── server.ts           # MCP server setup
│   ├── tools/
│   │   ├── tasks.ts        # Task tools
│   │   ├── tags.ts         # Tag tools
│   │   └── index.ts        # Tool registry
│   ├── resources/
│   │   └── summary.ts      # User summary resource
│   └── api-client.ts       # HTTP client para Task-It API
└── dist/                    # Compiled JS
```

**`package.json`**:
```json
{
  "name": "@task-it/mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

### T5.5: Implementar Tools de Tasks
**Bloqueante**: No
**Depende de**: T5.4

#### Tool: `create_task`

```typescript
server.tool(
  'create_task',
  'Crear una nueva tarea en Task-It',
  {
    title: z.string().describe('Título de la tarea'),
    description: z.string().optional().describe('Descripción detallada'),
    priority: z.enum(['high', 'medium', 'low']).optional().describe('Prioridad'),
    dueDate: z.string().optional().describe('Fecha límite (ISO 8601)'),
    tags: z.array(z.string()).optional().describe('Nombres de tags existentes'),
  },
  async ({ title, description, priority, dueDate, tags }) => {
    // 1. Si se pasan tags por nombre, resolver a IDs
    // 2. Llamar POST /api/v1/tasks
    // 3. Devolver confirmación
    return {
      content: [{
        type: 'text',
        text: `Tarea creada: "${title}" (${priority ?? 'medium'} priority)`
      }]
    }
  }
)
```

#### Tool: `list_tasks`

```typescript
server.tool(
  'list_tasks',
  'Listar tareas del usuario con filtros opcionales',
  {
    status: z.enum(['pending', 'in_progress', 'completed', 'all']).optional(),
    priority: z.enum(['high', 'medium', 'low', 'all']).optional(),
    search: z.string().optional().describe('Buscar en título y descripción'),
    overdue: z.boolean().optional().describe('Solo tareas vencidas'),
    limit: z.number().optional().describe('Máximo de resultados'),
  },
  async (params) => {
    const tasks = await apiClient.getTasks(params)
    const formatted = tasks.map(t =>
      `- [${t.status}] ${t.title} (${t.priority}) ${t.dueDate ? `📅 ${t.dueDate}` : ''}`
    ).join('\n')

    return {
      content: [{
        type: 'text',
        text: tasks.length > 0
          ? `${tasks.length} tareas encontradas:\n\n${formatted}`
          : 'No se encontraron tareas con esos filtros.'
      }]
    }
  }
)
```

#### Tool: `update_task`

```typescript
server.tool(
  'update_task',
  'Actualizar una tarea existente',
  {
    taskId: z.string().describe('ID de la tarea'),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    priority: z.enum(['high', 'medium', 'low']).optional(),
    dueDate: z.string().nullable().optional(),
  },
  async ({ taskId, ...updates }) => {
    const task = await apiClient.updateTask(taskId, updates)
    return {
      content: [{
        type: 'text',
        text: `Tarea actualizada: "${task.title}" → ${task.status}`
      }]
    }
  }
)
```

#### Tool: `complete_task`

Shortcut para marcar como completada:

```typescript
server.tool(
  'complete_task',
  'Marcar una tarea como completada',
  {
    taskId: z.string().describe('ID de la tarea a completar'),
  },
  async ({ taskId }) => {
    const task = await apiClient.updateTask(taskId, { status: 'completed' })
    return {
      content: [{
        type: 'text',
        text: `Tarea completada: "${task.title}"`
      }]
    }
  }
)
```

#### Tool: `delete_task`

```typescript
server.tool(
  'delete_task',
  'Eliminar una tarea',
  {
    taskId: z.string().describe('ID de la tarea a eliminar'),
  },
  async ({ taskId }) => {
    await apiClient.deleteTask(taskId)
    return {
      content: [{ type: 'text', text: 'Tarea eliminada correctamente.' }]
    }
  }
)
```

---

### T5.6: Implementar Tools de Tags
**Bloqueante**: No
**Paralelo con**: T5.5

#### Tool: `list_tags`

```typescript
server.tool(
  'list_tags',
  'Listar todas las etiquetas disponibles',
  {},
  async () => {
    const tags = await apiClient.getTags()
    const formatted = tags.map(t => `- ${t.name} (${t.color})`).join('\n')
    return {
      content: [{
        type: 'text',
        text: `${tags.length} tags:\n\n${formatted}`
      }]
    }
  }
)
```

#### Tool: `create_tag`

```typescript
server.tool(
  'create_tag',
  'Crear una nueva etiqueta',
  {
    name: z.string().describe('Nombre del tag'),
    color: z.enum([/* 17 colores */]).describe('Color del tag'),
  },
  async ({ name, color }) => {
    const tag = await apiClient.createTag({ name, color })
    return {
      content: [{
        type: 'text',
        text: `Tag creado: "${tag.name}" (${tag.color})`
      }]
    }
  }
)
```

---

### T5.7: Implementar Resources
**Bloqueante**: No
**Paralelo con**: T5.5, T5.6

#### Resource: `taskit://summary`

Proporciona un resumen del estado actual del usuario:

```typescript
server.resource(
  'taskit://summary',
  'Resumen del estado actual de las tareas del usuario',
  async () => {
    const tasks = await apiClient.getTasks()
    const pending = tasks.filter(t => t.status === 'pending').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const completed = tasks.filter(t => t.status === 'completed').length
    const overdue = tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length

    return {
      content: [{
        type: 'text',
        text: [
          `📊 Resumen de Task-It`,
          ``,
          `Total: ${tasks.length} tareas`,
          `- Pendientes: ${pending}`,
          `- En progreso: ${inProgress}`,
          `- Completadas: ${completed}`,
          `- Vencidas: ${overdue}`,
          ``,
          overdue > 0 ? `⚠️ Tienes ${overdue} tarea(s) vencida(s)!` : '✅ Sin tareas vencidas',
        ].join('\n')
      }]
    }
  }
)
```

#### Resource: `taskit://tasks/pending`

Lista las tareas pendientes con detalles:

```typescript
server.resource(
  'taskit://tasks/pending',
  'Lista detallada de tareas pendientes',
  async () => {
    const tasks = await apiClient.getTasks({ status: 'pending' })
    // Formatear como tabla markdown
    return { content: [{ type: 'text', text: formattedMarkdown }] }
  }
)
```

---

### T5.8: UI para gestión de API Keys en Settings
**Bloqueante**: No
**Paralelo con**: T5.4 - T5.7

Añadir sección en la página de Settings (`components/settings/SettingsApiKeys.tsx`):

**Funcionalidades**:
1. Listar API keys existentes (nombre, preview, last used)
2. Crear nueva API key (modal con nombre, muestra key UNA vez)
3. Revocar API key (con confirmación)
4. Instrucciones de configuración para Claude Code

**UI**:
```
┌─────────────────────────────────────┐
│ 🔑 API Keys                         │
│                                      │
│ Genera claves para usar Task-It     │
│ desde Claude Code u otros agentes.  │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ Claude Code                      │ │
│ │ tk_a1b2...j0  •  Hace 2 horas  │ │
│ │                    [Revocar]    │ │
│ └─────────────────────────────────┘ │
│                                      │
│ [+ Crear nueva API Key]             │
│                                      │
│ 📋 Configuración para Claude Code:  │
│ ┌─────────────────────────────────┐ │
│ │ {                                │ │
│ │   "mcpServers": {               │ │
│ │     "task-it": { ... }          │ │
│ │   }                              │ │
│ │ }                                │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### T5.9: Documentar instalación y uso del MCP
**Bloqueante**: No
**Depende de**: T5.4 - T5.7

Crear `mcp-server/README.md` con:
1. Instalación
2. Configuración de API key
3. Configuración en Claude Code
4. Configuración en Claude Desktop
5. Lista de tools disponibles
6. Ejemplos de uso

---

## Estructura de archivos resultante

```
task-it/
├── mcp-server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   └── src/
│       ├── index.ts
│       ├── server.ts
│       ├── api-client.ts
│       ├── tools/
│       │   ├── tasks.ts
│       │   ├── tags.ts
│       │   └── index.ts
│       └── resources/
│           └── summary.ts
├── app/
│   └── api/
│       └── v1/
│           └── api-keys/
│               ├── route.ts          # GET list + POST create
│               └── [id]/
│                   └── route.ts      # DELETE revoke
├── components/
│   └── settings/
│       └── SettingsApiKeys.tsx        # UI para gestión de keys
└── prisma/
    └── schema.prisma                  # + modelo ApiKey
```

## Tools MCP (Resumen)

| Tool | Descripción |
|------|-------------|
| `create_task` | Crear una nueva tarea |
| `list_tasks` | Listar tareas con filtros |
| `update_task` | Actualizar campos de una tarea |
| `complete_task` | Marcar tarea como completada |
| `delete_task` | Eliminar una tarea |
| `list_tags` | Listar tags disponibles |
| `create_tag` | Crear un nuevo tag |

## Resources MCP (Resumen)

| Resource | Descripción |
|----------|-------------|
| `taskit://summary` | Resumen general del estado de tareas |
| `taskit://tasks/pending` | Lista detallada de tareas pendientes |

## Criterios de Aceptación

- [ ] Modelo ApiKey en la base de datos
- [ ] Usuario puede crear/listar/revocar API keys desde Settings
- [ ] MCP server se conecta a la API vía API key
- [ ] `create_task` crea tarea visible en la UI web
- [ ] `list_tasks` devuelve tareas con filtros correctos
- [ ] `update_task` y `complete_task` modifican tareas correctamente
- [ ] `delete_task` elimina tareas
- [ ] `list_tags` y `create_tag` funcionan
- [ ] Resources devuelven información de resumen
- [ ] MCP server funciona con Claude Code (probado manualmente)
- [ ] `npm run build` (del MCP server) genera dist sin errores
- [ ] README con instrucciones claras de instalación
