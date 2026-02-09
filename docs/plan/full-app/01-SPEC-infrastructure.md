# Fase 0: Infraestructura y Base de Datos

> **Estado**: Pendiente
> **Bloquea**: Fase 1, 2, 3, 4, 5, 6
> **Bloqueado por**: Nada
> **Paralelizable**: No (es la base de todo)

## Objetivo

Configurar la infraestructura de base de datos, ORM y herramientas de validación necesarias para soportar el backend de Task-It.

## Stack

- **PostgreSQL** como base de datos relacional
- **Prisma** como ORM con type-safe queries
- **Zod** para validación de schemas en runtime

## Tareas

### T0.1: Instalar dependencias del backend
**Bloqueante**: Sí (todas las demás tareas de esta fase dependen de esto)
**Paralelo**: No

```bash
# Dependencias de producción
npm install prisma @prisma/client zod bcryptjs

# Dependencias de desarrollo
npm install -D @types/bcryptjs
```

Paquetes:
- `prisma` + `@prisma/client`: ORM y cliente de base de datos
- `zod`: Validación de schemas en runtime
- `bcryptjs`: Hashing de passwords (pure JS, sin native dependencies)

---

### T0.2: Configurar PostgreSQL local
**Bloqueante**: Sí
**Paralelo con**: T0.1

Opciones (elegir una):
1. **Docker** (recomendado):
   ```bash
   docker run --name taskit-db -e POSTGRES_PASSWORD=taskit -e POSTGRES_DB=taskit -p 5432:5432 -d postgres:16
   ```
2. **Instalación nativa**: `brew install postgresql@16`
3. **Cloud**: Neon, Supabase, Railway (para producción)

Crear archivo `.env`:
```env
DATABASE_URL="postgresql://postgres:taskit@localhost:5432/taskit?schema=public"
```

Añadir `.env` a `.gitignore` y crear `.env.example`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskit?schema=public"
```

---

### T0.3: Inicializar Prisma y definir schema
**Bloqueante**: Sí
**Depende de**: T0.1, T0.2

```bash
npx prisma init
```

Crear `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USUARIOS ──────────────────────────────

model User {
  id             String   @id @default(cuid())
  email          String   @unique
  name           String
  password       String   // bcrypt hash
  role           String   @default("developer")
  language       String   @default("es")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  tasks          Task[]
  tags           Tag[]
  settings       UserSettings?
  pomodoroSessions PomodoroSession[]

  @@map("users")
}

// ─── TAREAS ────────────────────────────────

model Task {
  id          String     @id @default(cuid())
  title       String
  description String     @default("")
  status      TaskStatus @default(PENDING)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  tags        Tag[]      // Many-to-many implícito via Prisma

  @@index([userId])
  @@index([userId, status])
  @@index([userId, dueDate])
  @@map("tasks")
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

enum TaskPriority {
  HIGH
  MEDIUM
  LOW
}

// ─── TAGS ──────────────────────────────────

model Tag {
  id        String   @id @default(cuid())
  name      String
  color     String
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  tasks     Task[]   // Many-to-many implícito via Prisma

  @@unique([userId, name]) // Un usuario no puede tener dos tags con el mismo nombre
  @@index([userId])
  @@map("tags")
}

// ─── CONFIGURACIÓN DE USUARIO ──────────────

model UserSettings {
  id                   String  @id @default(cuid())

  // Apariencia
  theme                String  @default("system") // light | dark | system

  // Pomodoro Config
  pomodoroFocusMin     Int     @default(25)
  pomodoroShortBreak   Int     @default(5)
  pomodoroLongBreak    Int     @default(15)
  pomodoroLongInterval Int     @default(4)
  pomodoroTotalMin     Int     @default(240)
  pomodoroAutoStart    Boolean @default(false)
  pomodoroSoundEnabled Boolean @default(true)

  // Notificaciones
  taskReminders        Boolean @default(true)
  dailySummary         Boolean @default(false)
  streakAlert          Boolean @default(true)

  userId               String  @unique
  user                 User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}

// ─── SESIONES POMODORO ─────────────────────

model PomodoroSession {
  id              String   @id @default(cuid())
  startedAt       DateTime
  completedAt     DateTime?
  totalMinutes    Int      // Duración total planificada
  focusMinutes    Int      // Minutos de focus completados
  sessionsPlanned Int      // Número de sesiones planificadas
  sessionsCompleted Int    // Número de sesiones completadas
  taskIds         String[] // IDs de tareas asociadas

  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, startedAt])
  @@map("pomodoro_sessions")
}
```

---

### T0.4: Ejecutar primera migración
**Bloqueante**: Sí
**Depende de**: T0.3

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Verificar que:
- Se crearon todas las tablas en PostgreSQL
- El cliente Prisma se generó correctamente
- Los tipos TypeScript están disponibles

---

### T0.5: Crear singleton del cliente Prisma
**Bloqueante**: Sí
**Depende de**: T0.4

Crear `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

> **Nota**: Esto evita crear múltiples instancias de PrismaClient en desarrollo con hot-reload de Next.js.

---

### T0.6: Crear schemas de validación con Zod
**Bloqueante**: No (puede hacerse en paralelo con la migración del frontend)
**Depende de**: T0.1

Crear `lib/validations/`:

```
lib/
└── validations/
    ├── auth.ts      # Login, Register schemas
    ├── task.ts      # Create, Update task schemas
    ├── tag.ts       # Create, Update tag schemas
    └── settings.ts  # Update settings schemas
```

Ejemplo `lib/validations/task.ts`:
```typescript
import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).default(''),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  dueDate: z.string().datetime().nullable().default(null),
  tagIds: z.array(z.string()).default([]),
})

export const updateTaskSchema = createTaskSchema.partial()

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
```

---

### T0.7: Crear seed de datos iniciales
**Bloqueante**: No
**Depende de**: T0.4

Crear `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Usuario de demo
  const hashedPassword = await bcrypt.hash('demo1234', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@taskit.dev' },
    update: {},
    create: {
      email: 'demo@taskit.dev',
      name: 'Demo User',
      password: hashedPassword,
      tags: {
        create: [
          { name: 'Trabajo', color: 'blue' },
          { name: 'Personal', color: 'green' },
          { name: 'Urgente', color: 'red' },
          { name: 'Reunión', color: 'purple' },
          { name: 'Idea', color: 'amber' },
        ],
      },
      settings: {
        create: {},
      },
    },
  })

  console.log(`Seeded user: ${user.email}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
```

Añadir a `package.json`:
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

---

## Estructura de archivos resultante

```
task-it/
├── prisma/
│   ├── schema.prisma          # Definición del modelo de datos
│   ├── seed.ts                # Datos iniciales
│   └── migrations/            # Auto-generado por Prisma
├── lib/
│   ├── prisma.ts              # Singleton del cliente
│   └── validations/
│       ├── auth.ts
│       ├── task.ts
│       ├── tag.ts
│       └── settings.ts
├── .env                       # Variables de entorno (NO en git)
└── .env.example               # Plantilla de variables
```

## Criterios de Aceptación

- [ ] PostgreSQL corriendo y accesible
- [ ] `npx prisma migrate dev` ejecuta sin errores
- [ ] `npx prisma studio` muestra todas las tablas
- [ ] `npx prisma db seed` crea el usuario demo con tags
- [ ] `lib/prisma.ts` exporta el cliente singleton
- [ ] Schemas Zod creados para todas las entidades
- [ ] `.env` está en `.gitignore`
- [ ] `.env.example` existe con plantilla
- [ ] `npm run build` sigue funcionando (no rompe el frontend)
