# Fase 1: Autenticación

> **Estado**: Pendiente
> **Bloquea**: Fase 2, 3, 4, 5
> **Bloqueado por**: Fase 0 (Infraestructura)
> **Paralelizable**: No (es bloqueante para todo lo que requiera usuario)

## Objetivo

Implementar un sistema de autenticación completo que permita registro, login, logout y protección de rutas. Cada usuario tendrá datos completamente aislados.

## Stack

- **Auth.js v5** (NextAuth): Framework de autenticación para Next.js
- **Credentials Provider**: Email + password (expandible a OAuth en el futuro)
- **bcryptjs**: Hashing de passwords
- **JWT**: Tokens de sesión via cookies HTTP-only

## Tareas

### T1.1: Instalar Auth.js
**Bloqueante**: Sí
**Paralelo**: No

```bash
npm install next-auth@beta @auth/prisma-adapter
```

Generar secret:
```bash
npx auth secret
```

Añadir a `.env`:
```env
AUTH_SECRET="generated-secret-here"
AUTH_URL="http://localhost:3000"
```

---

### T1.2: Configurar Auth.js con Prisma Adapter
**Bloqueante**: Sí
**Depende de**: T1.1

Crear `lib/auth.ts`:

```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validations/auth'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.password
        )

        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
```

> **Nota sobre Prisma Adapter**: Auth.js con Prisma Adapter requiere tablas adicionales (Account, Session, VerificationToken) en el schema. Sin embargo, al usar estrategia JWT (no database sessions), solo necesitamos la tabla User. Evaluar si se añaden las tablas adicionales para compatibilidad futura con OAuth providers.

---

### T1.3: Crear Route Handler de Auth.js
**Bloqueante**: Sí
**Depende de**: T1.2

Crear `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

---

### T1.4: Crear API de registro
**Bloqueante**: Sí
**Depende de**: T1.2

Crear `app/api/auth/register/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations/auth'

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { email, password, name } = parsed.data

  // Verificar email único
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return NextResponse.json(
      { error: 'El email ya está registrado' },
      { status: 409 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  // Crear usuario con tags y settings por defecto
  const user = await prisma.user.create({
    data: {
      email,
      name,
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
    select: { id: true, email: true, name: true },
  })

  return NextResponse.json(user, { status: 201 })
}
```

---

### T1.5: Crear middleware de protección de rutas
**Bloqueante**: Sí
**Depende de**: T1.3

Crear `middleware.ts` en la raíz del proyecto:

```typescript
import { auth } from '@/lib/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                     req.nextUrl.pathname.startsWith('/register')

  const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth')

  // Permitir rutas de auth API siempre
  if (isApiAuth) return

  // Si no está logueado y no está en página de auth, redirigir a login
  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }

  // Si está logueado y está en página de auth, redirigir a home
  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL('/', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
```

---

### T1.6: Crear página de Login
**Bloqueante**: Sí (no se puede probar el flujo sin UI)
**Depende de**: T1.5

Crear `app/login/page.tsx`:

**Componentes necesarios**:
- Formulario con email + password
- Botón de submit con loading state
- Link a registro
- Manejo de errores (credenciales inválidas)
- Diseño coherente con el design system existente (V3 Minimal Vibrant)

**Layout**:
- Centrado en pantalla
- Logo/título de Task-It
- Card con formulario
- Sin sidebar ni header (página independiente)

---

### T1.7: Crear página de Registro
**Bloqueante**: No (funcionalidad de login es más crítica)
**Paralelo con**: T1.6 (misma estructura, distinto formulario)

Crear `app/register/page.tsx`:

**Campos**:
- Nombre
- Email
- Password
- Confirmar password

**Validaciones**:
- Nombre: 2-50 caracteres
- Email: formato válido
- Password: mínimo 8 caracteres
- Confirmación: debe coincidir

---

### T1.8: Crear layout de autenticación
**Bloqueante**: No
**Paralelo con**: T1.6, T1.7

Crear `app/(auth)/layout.tsx`:

Layout compartido para login y registro:
- Sin sidebar
- Fondo con gradiente o patrón sutil
- Centrado vertical y horizontal
- Responsive (móvil primero)

> **Nota**: Usar route group `(auth)` para no afectar la URL. Las páginas de login y registro comparten este layout sin sidebar.

---

### T1.9: Integrar sesión en el layout principal
**Bloqueante**: Sí
**Depende de**: T1.5

Modificar `app/layout.tsx`:
- Envolver la app en `SessionProvider` de Auth.js
- Pasar la sesión del servidor al cliente

Modificar `components/layout/UserProfile.tsx`:
- Mostrar nombre e iniciales del usuario autenticado (de la sesión)
- Añadir botón/opción de logout

Modificar `components/layout/Sidebar.tsx`:
- Actualizar UserProfile con datos reales de sesión

---

### T1.10: Crear helper `getAuthUser` para Route Handlers
**Bloqueante**: Sí (lo usarán todos los endpoints API)
**Depende de**: T1.2

Crear `lib/auth-utils.ts`:

```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function getAuthUser() {
  const session = await auth()

  if (!session?.user?.id) {
    return { user: null, errorResponse: NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    )}
  }

  return { user: session.user, errorResponse: null }
}
```

Esto se usará en cada endpoint:
```typescript
export async function GET() {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  // ... lógica del endpoint con user.id
}
```

---

## Estructura de archivos resultante

```
task-it/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # Layout para auth pages (sin sidebar)
│   │   ├── login/
│   │   │   └── page.tsx            # Página de login
│   │   └── register/
│   │       └── page.tsx            # Página de registro
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts        # Auth.js route handler
│   │       └── register/
│   │           └── route.ts        # API de registro
│   └── layout.tsx                  # Modificado: SessionProvider
├── lib/
│   ├── auth.ts                     # Configuración de Auth.js
│   ├── auth-utils.ts               # Helper getAuthUser
│   └── validations/
│       └── auth.ts                 # Schemas de login/register
├── middleware.ts                    # Protección de rutas
└── .env                            # + AUTH_SECRET, AUTH_URL
```

## Schemas de validación (auth.ts)

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
```

## Criterios de Aceptación

- [ ] Un usuario puede registrarse con email + password
- [ ] Un usuario puede hacer login con credenciales válidas
- [ ] Login con credenciales inválidas muestra error apropiado
- [ ] Rutas protegidas redirigen a `/login` si no hay sesión
- [ ] `/login` y `/register` redirigen a `/` si hay sesión activa
- [ ] La sesión persiste entre recargas de página
- [ ] El nombre del usuario aparece en el sidebar
- [ ] El botón de logout cierra la sesión y redirige a `/login`
- [ ] Las páginas de auth tienen un diseño coherente con el resto de la app
- [ ] `npm run build` compila sin errores
- [ ] Las API routes de auth devuelven códigos HTTP correctos (200, 201, 400, 401, 409)
