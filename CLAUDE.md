# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Task-It** es una webapp de gestion de tareas enfocada en el control de pendientes laborales. El desarrollo sigue un enfoque **MVP** (Minimum Viable Product) - implementar solo lo esencial, evitar over-engineering.

### Stack Tecnico
- Next.js 16 con App Router
- React 19
- TypeScript 5
- Tailwind CSS v4
- lucide-react para iconos
- Prisma ORM con PostgreSQL
- Auth.js v5 (next-auth) con Credentials provider
- Zod para validaciones
- Vitest + Testing Library para tests

## Development Guidelines

### Principios MVP
- Funcionalidad minima que aporte valor real
- No anadir features "por si acaso"
- Iterar basandose en uso real

### UI/UX
- Mobile-first approach
- Interfaces limpias y minimalistas
- Feedback visual inmediato en acciones del usuario
- Estados de loading, error y empty states

### Commits
- Seguir Conventional Commits: `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`
- Mensajes en ingles, descriptivos y concisos

## Development Commands

```bash
# App
npm run dev          # Start development server at localhost:3000
npm run build        # Generate Prisma client + create production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm run test         # Run Vitest in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage report

# Database
npm run db:migrate   # Run Prisma migrations (dev)
npm run db:push      # Push schema to database without migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio GUI
npm run db:reset     # Reset database and re-run migrations

# Docker
npm run docker:up    # Start PostgreSQL container in background
npm run docker:down  # Stop containers
npm run docker:reset # Reset DB (removes volume and restarts)
npm run docker:logs  # Follow PostgreSQL logs
npm run setup        # One-command setup: start DB + migrate + seed

# MCP Server
npm run mcp:build    # Build MCP server
npm run mcp:dev      # Run MCP server in dev mode
```

## Docker Setup

### Prerequisites
- Docker and Docker Compose installed

### Quick Start

```bash
npm run setup
```

This single command starts the PostgreSQL container, runs Prisma migrations, and seeds the database.

### Individual Commands

```bash
npm run docker:up      # Start PostgreSQL in background
npm run docker:down    # Stop containers
npm run docker:reset   # Remove volume and restart (fresh DB)
npm run docker:logs    # Follow PostgreSQL logs
```

### Notes
- PostgreSQL runs on **port 5433** (external) to avoid conflicts with local PostgreSQL installations
- Connect directly with psql: `psql postgresql://taskit:taskit@localhost:5433/taskit`

## Environment Variables

All required environment variables are documented in `.env.example`:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/taskit?schema=public` |
| `AUTH_SECRET` | Auth.js secret key (generate with `npx auth secret`) | Random string |
| `AUTH_URL` | Base URL for auth callbacks | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## Architecture

- **Framework**: Next.js 16 with App Router (not Pages Router)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Auth.js v5 with JWT strategy, edge-compatible middleware
- **Styling**: Tailwind CSS v4 with PostCSS, dark mode via CSS variables and class-based toggle
- **Fonts**: Plus Jakarta Sans (headings), Inter (body), Geist (mono) via `next/font`
- **Icons**: lucide-react
- **Path alias**: `@/*` maps to project root

### Directory Structure

```
app/                          # Next.js App Router
├── layout.tsx                # Root layout with fonts and theme script
├── page.tsx                  # Main tasks view
├── globals.css               # CSS variables and theme definitions
├── (auth)/                   # Auth route group
│   ├── login/page.tsx        # Login page
│   └── register/page.tsx     # Registration page
├── calendar/page.tsx         # Calendar view
├── pomodoro/page.tsx         # Pomodoro timer view
├── analytics/page.tsx        # Analytics dashboard
├── settings/page.tsx         # User settings
└── api/
    ├── auth/
    │   ├── [...nextauth]/route.ts  # Auth.js handlers
    │   └── register/route.ts       # User registration (rate-limited)
    └── v1/                         # REST API v1
        ├── tasks/route.ts          # GET (list) / POST (create)
        ├── tasks/[id]/route.ts     # GET / PUT / DELETE single task
        ├── tags/route.ts           # GET / POST tags
        ├── tags/[id]/route.ts      # PUT / DELETE single tag
        ├── settings/route.ts       # GET / PUT user settings
        ├── settings/profile/route.ts # PUT user profile
        ├── pomodoro/sessions/route.ts # GET / POST pomodoro sessions
        ├── pomodoro/stats/route.ts    # GET pomodoro stats
        ├── analytics/route.ts       # GET analytics data
        ├── data/route.ts            # DELETE all user data
        ├── data/export/route.ts     # GET data export
        ├── data/import/route.ts     # POST data import
        ├── api-keys/route.ts        # GET / POST API keys
        └── api-keys/[id]/route.ts   # DELETE API key

components/
├── layout/             # Layout components (Sidebar, PageHeader, NavItem, UserProfile, AppShell)
├── task/               # Task components (TaskCard, TaskList, TaskForm, FilterChips, etc.)
├── calendar/           # Calendar components (CalendarView, MonthView, WeekView, DayView, etc.)
├── pomodoro/           # Pomodoro components (PomodoroView, TimerCircle, TimerControls, etc.)
├── analytics/          # Analytics components (AnalyticsView, KpiCard, WeeklyActivityChart, etc.)
├── settings/           # Settings components (SettingsView, SettingsProfile, SettingsApiKeys, etc.)
├── providers/          # React context providers (SessionProvider)
└── ui/                 # Reusable UI components (Button, Modal, Input, ThemeToggle, etc.)

hooks/
├── useTasks.ts         # Task CRUD operations via API
├── useTags.ts          # Tag management via API
├── useSettings.ts      # User settings with API sync
├── useTaskFilters.ts   # Filtering logic
├── useTheme.ts         # Theme state management (system/light/dark)
├── useCalendar.ts      # Calendar navigation
├── usePomodoro.ts      # Pomodoro timer logic
├── useAnalytics.ts     # Analytics data fetching
├── useLocalStorage.ts  # localStorage hook
└── useDebounce.ts      # Debounce hook

lib/
├── types.ts            # TypeScript types
├── constants.ts        # App constants
├── utils.ts            # Utility functions (cn, date formatting)
├── prisma.ts           # Prisma client singleton
├── auth.ts             # Auth.js configuration and handlers
├── auth.config.ts      # Auth.js edge-compatible config
├── auth-utils.ts       # Auth helper utilities
├── api-utils.ts        # API route helpers (auth, error handling)
├── api-client.ts       # Frontend API client
├── api-mappers.ts      # Prisma-to-frontend data mappers
├── api-key-auth.ts     # API key authentication
├── rate-limit.ts       # In-memory rate limiter for API endpoints
├── calendar-utils.ts   # Calendar utility functions
├── pomodoro-utils.ts   # Pomodoro utility functions
├── analytics-utils.ts  # Analytics utility functions
└── validations/        # Zod validation schemas
    ├── auth.ts         # Login/register schemas
    ├── task.ts         # Task create/update schemas
    ├── tag.ts          # Tag schemas
    ├── settings.ts     # Settings schemas
    ├── pomodoro.ts     # Pomodoro session schemas
    └── api-key.ts      # API key schemas

prisma/
├── schema.prisma       # Database schema (User, Task, Tag, UserSettings, PomodoroSession, ApiKey)
└── seed.ts             # Database seed script

middleware.ts           # Auth.js edge middleware for route protection

mcp-server/             # MCP Server package (@task-it/mcp-server)
├── src/
│   ├── index.ts        # Entry point
│   ├── server.ts       # MCP server setup
│   ├── api-client.ts   # API client for Task-It
│   ├── tools/          # MCP tools (tasks, tags)
│   └── resources/      # MCP resources (summary)
└── package.json

docs/
├── design/             # Pencil design files (.pen)
└── plan/               # Implementation plans
```

## API Endpoints Summary

All API routes require authentication (session or API key) unless noted.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (public, rate-limited) |
| POST/GET | `/api/auth/[...nextauth]` | Auth.js sign-in/sign-out handlers |
| GET | `/api/v1/tasks` | List tasks (supports filters) |
| POST | `/api/v1/tasks` | Create task |
| GET | `/api/v1/tasks/:id` | Get single task |
| PUT | `/api/v1/tasks/:id` | Update task |
| DELETE | `/api/v1/tasks/:id` | Delete task |
| GET | `/api/v1/tags` | List tags |
| POST | `/api/v1/tags` | Create tag |
| PUT | `/api/v1/tags/:id` | Update tag |
| DELETE | `/api/v1/tags/:id` | Delete tag |
| GET | `/api/v1/settings` | Get user settings |
| PUT | `/api/v1/settings` | Update user settings |
| PUT | `/api/v1/settings/profile` | Update user profile |
| GET | `/api/v1/pomodoro/sessions` | List pomodoro sessions |
| POST | `/api/v1/pomodoro/sessions` | Create pomodoro session |
| GET | `/api/v1/pomodoro/stats` | Get pomodoro statistics |
| GET | `/api/v1/analytics` | Get analytics dashboard data |
| GET | `/api/v1/data/export` | Export all user data (JSON) |
| POST | `/api/v1/data/import` | Import user data |
| DELETE | `/api/v1/data` | Delete all user data |
| GET | `/api/v1/api-keys` | List API keys |
| POST | `/api/v1/api-keys` | Create API key |
| DELETE | `/api/v1/api-keys/:id` | Revoke API key |

## MCP Server Setup

The MCP server allows AI assistants to interact with Task-It via the Model Context Protocol.

### Build and Run

```bash
# Build the MCP server
npm run mcp:build

# Run in development mode
npm run mcp:dev
```

### Configuration

Add to your MCP client configuration (e.g. Claude Desktop):

```json
{
  "mcpServers": {
    "task-it": {
      "command": "node",
      "args": ["<path-to-project>/mcp-server/dist/index.js"],
      "env": {
        "TASK_IT_API_URL": "http://localhost:3000",
        "TASK_IT_API_KEY": "<your-api-key>"
      }
    }
  }
}
```

Generate an API key from Settings > API Keys in the Task-It UI.

## Database Schema

Prisma models defined in `prisma/schema.prisma`:
- **User**: id, email, password, name, avatar
- **Task**: id, title, description, status, priority, dueDate, userId, tags (many-to-many)
- **Tag**: id, name, color, userId, tasks (many-to-many)
- **UserSettings**: id, userId, theme, pomodoroWork/Break/LongBreak, notifications
- **PomodoroSession**: id, type, duration, taskId, userId, completedAt
- **ApiKey**: id, name, key (hashed), userId, lastUsedAt, expiresAt

## Configuration

- **TypeScript**: Strict mode enabled, ES2017 target, bundler module resolution
- **ESLint**: Flat config format with next/core-web-vitals and next/typescript presets
- **Testing**: Vitest with jsdom, React Testing Library, MSW for API mocking
- **Security**: Rate limiting on auth endpoints, OWASP security headers via next.config.ts

## Design System: V3 Minimal Vibrant

### CSS Variables (defined in globals.css)
```css
/* Light theme (default) */
--background: #FFFFFF
--foreground: #18181B
--primary: #8B5CF6        /* Violet - main accent */
--secondary: #F4F4F5      /* Gray - cards, inputs */
--muted-foreground: #71717A
--border: #E4E4E7
--card: #F4F4F5

/* Dark theme (.dark class) */
--background: #18181B
--foreground: #FAFAFA
--primary: #A78BFA
--secondary: #27272A
--card: #27272A
```

### Border Radius Tokens
- `--radius-sm`: 14px (nav items, inputs)
- `--radius-md`: 20px (filter chips, avatars)
- `--radius-lg`: 24px (cards, buttons)

### Key Components
- **Sidebar**: 260px fixed width, contains nav + theme toggle + user profile
- **PageHeader**: Title + subtitle + search bar + action buttons
- **TaskCard**: Horizontal layout with circular checkbox, tag badge, date
- **FilterChips**: Horizontal tag-based filters

## Correcciones y Lecciones Aprendidas

### NUNCA usar colores hex hardcodeados
**Problema**: Los colores hex como `bg-[#F4F4F5]` o `text-[#71717A]` no responden al cambio de tema.

**Solucion**: Siempre usar variables CSS de Tailwind:
```tsx
// MAL
className="bg-[#F4F4F5] text-[#71717A]"

// BIEN
className="bg-card text-muted-foreground"
```

**Mapeo de colores:**
| Hex (Light) | Variable Tailwind |
|-------------|-------------------|
| `#FFFFFF` | `bg-background` |
| `#F4F4F5` | `bg-secondary` o `bg-card` |
| `#8B5CF6` | `bg-primary` o `text-primary` |
| `#18181B` | `text-foreground` |
| `#71717A` | `text-muted-foreground` |
| `#E4E4E7` | `border-border` |

### Dark mode en badges de colores
Para tags/badges con colores especificos, anadir variante dark:
```tsx
// Ejemplo para tag naranja
className="bg-orange-500/20 text-orange-600 dark:text-orange-400"
```

### Theme Toggle
El componente `ThemeToggle` esta en el Sidebar. Usa el hook `useTheme` que:
- Persiste en localStorage con key `task-it-theme`
- Soporta 3 modos: `system`, `light`, `dark`
- El script inline en layout.tsx previene flash de tema al cargar

### Diseno en Pencil.app
El archivo de diseno esta en `docs/design/task-it.pen`. Frame de referencia: "Task Manager App V3 - Minimal Vibrant".
