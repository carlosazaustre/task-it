# Fase 6: Testing y Producción

> **Estado**: Pendiente
> **Bloquea**: Nada (fase final)
> **Bloqueado por**: Fases 3, 4, 5
> **Paralelizable**: Parcialmente (testing puede empezar antes de que todo esté completo)

## Objetivo

Establecer un framework de testing, preparar la aplicación para producción, y configurar el pipeline de despliegue. Asegurar que todo funcione correctamente de extremo a extremo.

## Tareas

---

### T6.1: Configurar framework de testing
**Bloqueante**: Sí (base para todos los tests)
**Paralelo**: No

**Stack de testing**:
- **Vitest**: Test runner (más rápido que Jest, soporte nativo ESM)
- **Testing Library**: Para tests de componentes React
- **MSW (Mock Service Worker)**: Para mockear API calls en tests de frontend

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom msw
```

Crear `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

Añadir scripts a `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

### T6.2: Tests de API endpoints
**Bloqueante**: No
**Paralelo con**: T6.3, T6.4

**Estructura de tests**:
```
tests/
├── setup.ts                    # Global setup
├── helpers/
│   ├── db.ts                   # Test DB helpers (seed, cleanup)
│   └── auth.ts                 # Test auth helpers
└── api/
    ├── tasks.test.ts           # Tests CRUD de tasks
    ├── tags.test.ts            # Tests CRUD de tags
    ├── auth.test.ts            # Tests de login/register
    ├── settings.test.ts        # Tests de settings
    └── api-keys.test.ts        # Tests de API keys
```

**Tests clave para tasks**:
```typescript
describe('POST /api/v1/tasks', () => {
  it('crea una tarea con datos válidos')
  it('rechaza datos inválidos (400)')
  it('rechaza sin autenticación (401)')
  it('título obligatorio')
  it('asocia tags correctamente')
})

describe('GET /api/v1/tasks', () => {
  it('devuelve solo las tareas del usuario autenticado')
  it('filtra por status')
  it('filtra por priority')
  it('búsqueda por texto funciona (case-insensitive)')
  it('paginación funciona')
  it('no devuelve tareas de otros usuarios')
})

describe('PATCH /api/v1/tasks/:id', () => {
  it('actualiza campos parciales')
  it('no permite actualizar tareas de otro usuario (404)')
  it('actualiza tags correctamente')
})

describe('DELETE /api/v1/tasks/:id', () => {
  it('elimina la tarea')
  it('no permite eliminar tareas de otro usuario (404)')
  it('devuelve 204')
})
```

---

### T6.3: Tests de hooks migrados
**Bloqueante**: No
**Paralelo con**: T6.2, T6.4

Usando MSW para mockear las API calls:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useTasks } from '@/hooks/useTasks'

describe('useTasks', () => {
  it('carga tareas al montar')
  it('isLoading es true durante la carga')
  it('addTask añade optimistamente')
  it('addTask revierte si la API falla')
  it('updateTask actualiza optimistamente')
  it('deleteTask elimina optimistamente')
  it('cycleStatus cicla pending → in_progress → completed')
})
```

---

### T6.4: Tests de autenticación
**Bloqueante**: No
**Paralelo con**: T6.2, T6.3

```typescript
describe('Authentication', () => {
  it('registro crea usuario con tags por defecto')
  it('registro rechaza email duplicado')
  it('login funciona con credenciales válidas')
  it('login rechaza credenciales inválidas')
  it('middleware redirige a /login sin sesión')
  it('middleware redirige a / con sesión en /login')
  it('API key autentica correctamente')
  it('API key inválida devuelve 401')
})
```

---

### T6.5: Test E2E del flujo MCP
**Bloqueante**: No
**Paralelo con**: T6.2 - T6.4

Test manual documentado (checklist):

```markdown
## Checklist E2E: MCP Server

### Setup
- [ ] API corriendo en localhost:3000
- [ ] Usuario con API key generada
- [ ] MCP server configurado en Claude Code settings

### Flujo
- [ ] Claude Code detecta el MCP server de task-it
- [ ] `list_tasks` devuelve las tareas del usuario
- [ ] `create_task` crea tarea visible en la UI web
- [ ] `complete_task` marca tarea como completada
- [ ] `list_tags` muestra tags disponibles
- [ ] `create_tag` crea tag usable en nuevas tareas
- [ ] `delete_task` elimina tarea
- [ ] Resource `taskit://summary` muestra resumen correcto
```

---

### T6.6: Variables de entorno para producción
**Bloqueante**: Sí (necesario para deploy)
**Paralelo con**: T6.2 - T6.5

Actualizar `.env.example`:
```env
# Base de datos
DATABASE_URL="postgresql://user:password@host:5432/taskit?schema=public"

# Auth
AUTH_SECRET="generate-with-npx-auth-secret"
AUTH_URL="https://your-domain.com"

# App
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"
```

---

### T6.7: Preparar para deployment
**Bloqueante**: No
**Paralelo con**: T6.2 - T6.5

**Opciones de deploy**:

| Plataforma | Ventajas | DB |
|-----------|---------|-----|
| **Vercel** | Zero-config para Next.js | Neon (serverless Postgres) |
| **Railway** | Full-stack en un solo servicio | Railway Postgres |
| **Fly.io** | Containers, buen pricing | Fly Postgres |

**Para Vercel + Neon (recomendado)**:
1. Crear proyecto en Neon (PostgreSQL serverless)
2. Configurar `DATABASE_URL` en Vercel environment variables
3. `npx prisma migrate deploy` en build command
4. Configurar `AUTH_SECRET` y `AUTH_URL` en Vercel

**`next.config.ts`** (si es necesario):
```typescript
const nextConfig = {
  // Asegurar que Prisma funciona en serverless
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
}
```

**Build command**:
```bash
npx prisma generate && npx prisma migrate deploy && next build
```

---

### T6.8: Seguridad y hardening
**Bloqueante**: No
**Paralelo con**: T6.2 - T6.7

**Checklist de seguridad**:

- [ ] **Rate limiting**: Implementar rate limit en endpoints de auth (login, register)
  - Opción: `next-rate-limit` o header-based con Vercel/Cloudflare
  - Login: 5 intentos por minuto por IP
  - Register: 3 por hora por IP

- [ ] **Input sanitization**: Zod ya valida tipos, pero verificar:
  - No HTML/script injection en title/description
  - Longitudes máximas respetadas

- [ ] **Headers de seguridad**:
  ```typescript
  // next.config.ts
  headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ]
  ```

- [ ] **CORS**: Configurar si la API se consume desde otros dominios

- [ ] **API Key hashing**: Considerar hashear las API keys en DB (como passwords) y comparar con timing-safe comparison

---

### T6.9: Documentación final
**Bloqueante**: No
**Paralelo con**: T6.2 - T6.8

Actualizar `CLAUDE.md` con:
- Nuevos comandos (`npx prisma studio`, `npx prisma migrate dev`)
- Estructura actualizada de directorios
- Variables de entorno necesarias
- Endpoints API disponibles
- Instrucciones de setup del MCP server

---

## Scripts finales en package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "npx prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "db:migrate": "npx prisma migrate dev",
    "db:push": "npx prisma db push",
    "db:seed": "npx prisma db seed",
    "db:studio": "npx prisma studio",
    "db:reset": "npx prisma migrate reset",
    "mcp:build": "cd mcp-server && npm run build",
    "mcp:dev": "cd mcp-server && npm run dev"
  }
}
```

## Criterios de Aceptación

- [ ] Framework de testing configurado y funcionando
- [ ] Tests de API con cobertura de happy path y errores
- [ ] Tests de hooks con mocks de API
- [ ] Tests de autenticación (registro, login, protección)
- [ ] MCP server probado end-to-end con Claude Code
- [ ] Variables de entorno documentadas
- [ ] Build de producción exitoso
- [ ] Seguridad: rate limiting, headers, input validation
- [ ] CLAUDE.md actualizado con nuevas instrucciones
- [ ] README del MCP server completo
