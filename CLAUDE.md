# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Task-It** es una webapp de gestión de tareas enfocada en el control de pendientes laborales. El desarrollo sigue un enfoque **MVP** (Minimum Viable Product) - implementar solo lo esencial, evitar over-engineering.

### Stack Técnico
- Next.js 16 con App Router
- React 19
- TypeScript 5
- Tailwind CSS v4

## Development Guidelines

### Principios MVP
- Funcionalidad mínima que aporte valor real
- No añadir features "por si acaso"
- Iterar basándose en uso real

### UI/UX
- Mobile-first approach
- Interfaces limpias y minimalistas
- Feedback visual inmediato en acciones del usuario
- Estados de loading, error y empty states

### Commits
- Seguir Conventional Commits: `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`
- Mensajes en inglés, descriptivos y concisos

## Development Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

- **Framework**: Next.js 16 with App Router (not Pages Router)
- **Styling**: Tailwind CSS v4 with PostCSS, dark mode via CSS variables and `prefers-color-scheme`
- **Fonts**: Geist font family via `next/font`
- **Path alias**: `@/*` maps to project root

### Directory Structure

```
app/           # Next.js App Router - pages, layouts, and route handlers
public/        # Static assets served at root
```

## Configuration

- **TypeScript**: Strict mode enabled, ES2017 target, bundler module resolution
- **ESLint**: Flat config format with next/core-web-vitals and next/typescript presets
- **No testing framework configured yet**

## Correcciones y Lecciones Aprendidas

<!-- Añadir aquí errores cometidos y sus soluciones para no repetirlos -->
