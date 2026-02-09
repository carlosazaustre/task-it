# Changelog

All notable changes to **Task-It** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.0.0] - 2026-02-09

### Added

**Backend & Database**
- PostgreSQL database with Prisma ORM (6 models: User, Task, Tag, UserSettings, PomodoroSession, ApiKey).
- Database migrations and seed data with default tags and settings per user.
- Docker Compose setup with PostgreSQL 17 Alpine (port 5433, health checks, persistent volume).
- `npm run setup` one-command project initialization (Docker + migrations + seed).

**Authentication**
- Auth.js (NextAuth v5) with credentials provider and JWT strategy.
- User registration (`/api/auth/register`) with bcrypt password hashing and rate limiting.
- Login/Register pages with form validation.
- Route protection via Next.js middleware.
- Dual auth system: session cookies (frontend) + API key Bearer tokens (MCP/external).

**REST API (22 endpoints at /api/v1/)**
- Tasks CRUD with pagination, filtering (status, priority, tags, search, overdue), and sorting.
- Tags CRUD with duplicate name detection and ownership scoping.
- Settings GET/PATCH with deep merge and upsert.
- Profile GET/PATCH with computed initials.
- Pomodoro sessions POST/GET with date range filtering.
- Pomodoro stats aggregation (total, weekly, averages).
- Analytics endpoint with KPIs, trends, weekly activity, tag distribution.
- Data export/import (JSON) with atomic transactions.
- Data delete with confirmation header requirement.
- API Keys management (create, list, revoke).

**Frontend Migration**
- API client (`lib/api-client.ts`) with typed methods, error handling, and response unwrapping.
- `useTasks` and `useTags` hooks migrated from localStorage to API calls with optimistic updates.
- `useSettings` hook with API sync on mount and fire-and-forget updates.
- Error states and retry buttons in TaskList and TaskForm components.
- API Keys management UI in Settings page.

**MCP Server**
- Standalone MCP server package (`mcp-server/`) with stdio transport.
- 7 tools: create_task, list_tasks, update_task, complete_task, delete_task, list_tags, create_tag.
- 2 resources: taskit://summary, taskit://tasks/pending.

**Testing & Security**
- Vitest test suite with 93 tests (API endpoints + hooks).
- Rate limiting on auth endpoints (in-memory sliding window).
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).

### Fixed

- Data export/import now uses the database API instead of localStorage (data was invisible after import).
- Legacy localStorage export format is auto-detected and transformed during import for backward compatibility.

### Changed

- `useTasks` and `useTags` no longer use localStorage (source of truth is now the database).
- `exportData`, `importData`, and `clearAllData` in useSettings now operate through the REST API.
- Build script now runs `prisma generate` before `next build`.
- UserProfile component uses Auth.js session instead of localStorage.

---

## [0.6.0] - 2026-02-08

### Added

- **Settings page** at `/settings` with 6 configurable sections:
  - **Profile**: edit name, email, role, and language with auto-generated avatar initials.
  - **Appearance**: visual theme selector (light/dark/system) with preview cards and ARIA radio semantics.
  - **Pomodoro**: focus/break duration selects, auto-start and sound toggles.
  - **Notifications**: toggles for task reminders, daily summary, and streak alerts.
  - **Tags**: full CRUD management with color picker grid, inline edit/delete, and modal form.
  - **Data**: JSON export/import with file validation, and danger zone with delete confirmation modal.
- `useSettings` hook for centralized localStorage persistence of profile, notifications, pomodoro preferences, and data management.
- Shared `Toggle` and `ReadOnlyField` UI components extracted during code review.
- `TAG_COLOR_CLASS` constant centralized in `lib/constants.ts` for design system consistency.
- Settings sidebar navigation with smooth scroll-to-section behavior (hidden on mobile).
- Sidebar "Ajustes" link now navigates to `/settings`.

---

## [0.5.0] - 2026-02-08

### Added

- **Dashboard Analytics** view at `/analytics` with productivity metrics computed from existing localStorage data.
  - **4 KPI cards**: Tareas Completadas, Tasa de Completado, Tiempo de Focus, and Racha Actual — each with trend badges comparing current vs. previous period.
  - **Weekly Activity chart** (CSS-only, no chart library) with paired bars for completed (violet) and pending (gray) tasks per day (Mon–Sun), highlighting the current day.
  - **Tag Distribution** with SVG donut chart and progress bars per tag, showing proportional task counts.
  - **Recent Activity** feed with the last 5 actions (completed, created) and relative timestamps.
  - **Date range selector** dropdown with 4 options: Esta semana, Últimos 7 días, Este mes, Últimos 30 días — persisted in localStorage.
  - Export button (disabled for MVP, placeholder for future iteration).
  - `useAnalytics` hook composing `useTasks`, `useTags`, and Pomodoro state with full memoization.
  - Pure utility functions in `analytics-utils.ts`: date ranges, KPI computation, streak calculation, weekly activity, tag distribution, recent activity, and relative time formatting.
  - Analytics types: `AnalyticsDateRange`, `KpiData`, `KpiTrend`, `DailyActivity`, `TagCount`, `ActivityItem`, `AnalyticsData`.
  - Responsive layout: 2-column KPIs on mobile, 4-column on desktop; stacked bottom panels on mobile.
  - Full dark mode support using CSS variables.
  - Accessible dropdown with ARIA attributes (`aria-haspopup`, `aria-expanded`, `role="listbox"`).

### Changed

- Sidebar navigation: "Dashboard" now links to `/analytics`, "Mis Tareas" correctly activates on `/`.

## [0.4.0] - 2026-02-07

### Added

- **Pomodoro timer** with three views: session setup, active session, and configuration modal.
  - Session setup with stat cards (duration, focus time, breaks, total sessions), task assignment, and auto-generated session plan.
  - Active session with circular SVG countdown timer (280x280), play/pause/skip controls, and session progress dots.
  - Configuration modal with duration presets (2h/4h/6h/8h), focus/break selects, and live summary.
  - `usePomodoro` hook with full state management, 1-second interval timer, and localStorage persistence.
  - Pure utility functions (`generateSessionPlan`, `distributeTasksToSessions`, `formatSecondsAsTimer`, etc.).
  - Pomodoro types (`PomodoroConfig`, `PomodoroSession`, `PomodoroState`) and constants.
  - Navigation item in sidebar with `Timer` icon.
- **Responsive mobile sidebar** with hamburger menu button and backdrop overlay, applied globally via `AppShell`.

## [0.3.0] - 2026-02-07

### Added

- **Calendar view** with three modes: month, week, and day.
  - Month view with 7-column grid, task badges, and day navigation.
  - Week view with time axis, all-day task row, and hour grid.
  - Day view with two-column layout (timeline + mini-calendar sidebar).
  - `useCalendar` hook with URL-based state management (`?view=month&date=2025-02`).
  - Task editing via modal from any calendar view.
  - Date utility functions and routing infrastructure (`AppShell`, `NavItem` Link support).
- **CI/CD pipeline** with GitHub Actions workflow: lint + build checks on push/PR to main, Coolify deployment via webhook.

### Fixed

- CI workflow `curl` failing with exit code 60 on self-signed SSL certificate (added `--insecure` flag).

### Changed

- Refactored code structure for improved readability and maintainability.

## [0.2.0] - 2026-02-05

### Added

- **Dark mode** with three modes: system, light, and dark.
  - `useTheme` hook for theme state management with localStorage persistence.
  - `ThemeToggle` component in sidebar.
  - Inline script in root layout to prevent theme flash on page load.
  - CSS variables for light and dark themes.
- **Sidebar** with navigation, user profile, and theme toggle.
  - `NavItem` component with Lucide icon support.
  - `UserProfile` component with avatar display.
- **Page header** component with search bar and actions slot.
- **Filter chips** component for tag-based task filtering.
- **Pencil design file** for V3 Minimal Vibrant reference (`docs/design/task-it.pen`).

### Changed

- Redesigned `TaskCard` with horizontal layout and circular checkbox for V3 Minimal Vibrant style.
- Updated `TaskList` to vertical layout with proper spacing.
- Replaced all hardcoded hex colors with CSS variables across UI components for theme compatibility.
- Updated `Modal`, `Badge`, task badges, and form components for dark mode support.
- Integrated sidebar and page header into main page layout, replaced previous header.
- Moved search functionality from standalone to `PageHeader` component.

### Documentation

- Comprehensive README with project description, features, tech stack, architecture, and contribution guidelines.
- Updated `CLAUDE.md` with design system reference, CSS variables, lessons learned (no hardcoded hex colors), and dark mode patterns.

## [0.1.0] - 2026-02-04

### Added

- **Initial project setup** with Next.js 16, React 19, TypeScript 5, and Tailwind CSS v4.
- **Reusable UI components**: Button, Input, Textarea, Select, Badge, Modal, EmptyState, Spinner.
- **Task management hooks**: `useTasks` (CRUD with localStorage), `useTags` (tag management), `useTaskFilters` (filtering logic), `useLocalStorage` (SSR-safe persistence with cross-tab sync).
- **Type system**: Task, Tag, TaskFormData, TaskFilters, TaskSort, and related types.
- **Constants**: task statuses, priorities, tag colors, validation limits, and storage keys.
- **Utility functions**: `cn()` (Tailwind class merging), `generateId()`, `formatRelativeDate()`, `formatShortDate()`.
- Added `clsx` and `tailwind-merge` dependencies for styling management.
