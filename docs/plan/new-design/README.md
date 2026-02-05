# Plan de Implementación: Vista Principal V3 Minimal Vibrant

Este documento detalla el plan para alinear la vista principal de Task-It con el diseño "Task Manager App V3 - Minimal Vibrant" de Pencil.app.

## Estado Actual vs Diseño Objetivo

### Diseño Objetivo (Pencil.app)
![Referencia: docs/design/task-it.pen - Frame "Task Manager App V3 - Minimal Vibrant"]

**Layout principal:**
- Sidebar fija de 260px a la izquierda
- Main Content ocupando el resto del ancho
- Dimensiones de referencia: 1440x900px

**Componentes principales:**
1. **Sidebar** (fondo #F4F4F5)
   - Logo "Task-It" con marca violeta
   - Navegación vertical: Dashboard, Mis Tareas, Calendario, Ajustes
   - Perfil de usuario en la parte inferior

2. **Main Content** (fondo #FFFFFF)
   - Header con título "Mis Tareas" y subtítulo
   - Barra de búsqueda + botón "Nueva Tarea"
   - Filtros como chips horizontales (por categoría)
   - Lista de tareas en cards planas

### Implementación Actual
- Header horizontal sticky superior
- Sin sidebar de navegación
- Contenido centrado con container
- Filtros complejos (estado, prioridad, etiquetas)
- Task cards con border-left de color

## Archivos del Plan

1. [01-analisis-diferencias.md](./01-analisis-diferencias.md) - Análisis detallado de diferencias
2. [02-componentes-nuevos.md](./02-componentes-nuevos.md) - Componentes a crear
3. [03-componentes-modificar.md](./03-componentes-modificar.md) - Componentes a modificar
4. [04-orden-implementacion.md](./04-orden-implementacion.md) - Secuencia de implementación
5. [05-especificaciones-diseño.md](./05-especificaciones-diseño.md) - Tokens y especificaciones de diseño

## Resumen de Cambios

| Área | Acción | Prioridad |
|------|--------|-----------|
| Layout principal | Reestructurar a Sidebar + Main | Alta |
| Sidebar | Crear componente nuevo | Alta |
| Header | Mover a Main Content | Alta |
| Filtros | Simplificar a chips de categorías | Media |
| Task Cards | Ajustar al nuevo diseño | Media |
| Navegación | Implementar routing | Baja (futuro) |

## Principios a Seguir

- **MVP**: Implementar solo lo visual necesario
- **Mobile-first**: Sidebar colapsable en móvil
- **Reutilización**: Aprovechar componentes UI existentes
- **Variables CSS**: Usar el sistema de tokens ya definido
