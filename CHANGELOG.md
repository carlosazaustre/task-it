# Changelog

All notable changes to **Task-It** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

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
