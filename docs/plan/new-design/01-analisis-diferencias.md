# Análisis Detallado de Diferencias

## 1. Layout Principal

### Diseño (Pencil)
```
┌─────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌─────────────────────────────────┐  │
│  │          │  │                                 │  │
│  │ SIDEBAR  │  │         MAIN CONTENT            │  │
│  │  260px   │  │         (fill)                  │  │
│  │          │  │                                 │  │
│  │          │  │                                 │  │
│  └──────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Actual (Código)
```
┌─────────────────────────────────────────────────────┐
│               HEADER (sticky top)                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│              MAIN (container centered)              │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Acción:** Reestructurar completamente el layout de `app/page.tsx`

---

## 2. Sidebar

### Diseño (Pencil)
- **Ancho:** 260px
- **Fondo:** #F4F4F5 (--secondary)
- **Padding:** 28px vertical, 20px horizontal
- **Estructura:**
  - Logo (arriba)
  - Navegación vertical (centro, fill)
  - Perfil usuario (abajo)

#### Logo
- Icono check en círculo violeta (32x32px, cornerRadius: 10)
- Texto "Task-It" (Plus Jakarta Sans, 20px, bold, #18181B)
- Gap entre icono y texto: 12px

#### Navegación
- 4 items: Dashboard, Mis Tareas, Calendario, Ajustes
- Item activo: fondo #8B5CF6, texto blanco, icono blanco
- Item inactivo: sin fondo, texto #71717A, icono #71717A
- Padding item: 12px vertical, 14px horizontal
- Corner radius: 14px
- Gap entre icono y texto: 12px
- Gap entre items: 8px
- Iconos Lucide: layout-dashboard, list-todo, calendar, settings

#### Perfil Usuario
- Avatar circular (40x40px, cornerRadius: 20, fondo #8B5CF6)
- Iniciales en blanco (Inter, 13px, semibold)
- Nombre (Inter, 14px, semibold, #18181B)
- Rol (Inter, 12px, normal, #71717A)
- Gap entre avatar y texto: 12px

### Actual (Código)
**No existe** - Crear componente nuevo

---

## 3. Header del Main Content

### Diseño (Pencil)
- **Layout:** Row, justify-between
- **Padding contenedor:** 40px vertical, 48px horizontal

#### Lado Izquierdo
- Título "Mis Tareas" (Plus Jakarta Sans, 34px, bold, #18181B, lineHeight: 1.1)
- Subtítulo "Gestiona y organiza tus tareas diarias" (Inter, 14px, normal, #71717A)
- Gap: 4px

#### Lado Derecho
- **Barra búsqueda:**
  - Ancho: 320px, alto: 52px
  - Fondo: #F4F4F5
  - Corner radius: 26px
  - Padding horizontal: 20px
  - Icono search + placeholder "Buscar tareas..."

- **Botón Nueva Tarea:**
  - Fondo: #8B5CF6
  - Corner radius: 24px
  - Padding: 10px vertical, 18px horizontal
  - Icono plus + texto "Nueva Tarea" (blanco)
  - Gap entre icono y texto: 6px

- Gap entre search y botón: 12px

### Actual (Código)
- Header como componente sticky separado
- Título + subtítulo a la izquierda
- ThemeToggle + Botón a la derecha
- Sin barra de búsqueda en header (está en filtros)

**Acción:** Rediseñar header como parte del Main Content

---

## 4. Filtros

### Diseño (Pencil)
- **Layout:** Row, gap: 12px
- **Tipo:** Chips simples por categoría/tag
- **Filtros:** Todas, Trabajo, Personal, Urgente, Reunión, Idea

#### Chip Activo
- Fondo: #8B5CF620 (violeta 12.5% opacity)
- Texto: #8B5CF6 (Inter, 13px, semibold)
- Padding: 8px vertical, 16px horizontal
- Corner radius: 20px

#### Chip Inactivo
- Fondo: #F4F4F5
- Texto: #71717A (Inter, 13px, medium)
- Padding: 8px vertical, 16px horizontal
- Corner radius: 20px

### Actual (Código)
- **3 secciones de filtros:**
  1. Búsqueda (input)
  2. Estado (Todos, Pendiente, En progreso, Completado)
  3. Prioridad (Todas, Alta, Media, Baja)
  4. Etiquetas (dinámicas)
- En card con fondo
- Más complejo que el diseño

**Acción:**
- Mover búsqueda al header
- Simplificar filtros a una fila de chips de categorías
- Decidir si mantener filtros avanzados en dropdown/modal

---

## 5. Task Cards

### Diseño (Pencil)
- **Layout:** Row, justify-between, align-center
- **Fondo:** #F4F4F5
- **Corner radius:** 24px
- **Padding:** 20px
- **Gap entre cards:** 12px

#### Lado Izquierdo (task content)
- **Checkbox de estado:**
  - Círculo 28x28px, cornerRadius: 14
  - Completado: fondo #8B5CF6, icono check blanco
  - Pendiente: borde #E4E4E7, sin fondo

- **Contenido:**
  - Título (Inter, 16px, semibold, #18181B)
  - Meta: "Trabajo · Hoy, 10:00 AM" (Inter, 13px, normal, #71717A)
  - Gap: 2px

- Gap entre checkbox y contenido: 16px

#### Lado Derecho (badges)
- **Tag badge:**
  - Texto del tag (Inter, 11px, semibold)
  - Color según tag (ej: #F59E0B para "Trabajo")
  - Fondo: color con 12.5% opacity (ej: #F59E0B20)
  - Padding: 4px vertical, 10px horizontal
  - Corner radius: 12px

- **Fecha:**
  - Texto: "15 Feb" (Inter, 12px, medium, #A1A1AA)

- Gap: 8px, layout vertical, align-end

### Actual (Código)
- Border-left de color según estado
- Estructura más compleja:
  - Header: Priority badge + Title + Status badge
  - Description
  - Footer: Due date + Tags
  - Actions: Edit + Delete buttons

**Acción:**
- Simplificar estructura de TaskCard
- Cambiar de border-left a checkbox circular
- Mover acciones a hover/click o menú contextual
- Ajustar layout a diseño horizontal

---

## 6. Tipografía

### Diseño (Pencil)
| Elemento | Font | Size | Weight | Color |
|----------|------|------|--------|-------|
| Logo | Plus Jakarta Sans | 20px | 700 | #18181B |
| Título página | Plus Jakarta Sans | 34px | 700 | #18181B |
| Subtítulo | Inter | 14px | 400 | #71717A |
| Nav item activo | Inter | 14px | 600 | #FFFFFF |
| Nav item inactivo | Inter | 14px | 500 | #71717A |
| Task título | Inter | 16px | 600 | #18181B |
| Task meta | Inter | 13px | 400 | #71717A |
| Filter chip | Inter | 13px | 500/600 | varies |
| Tag badge | Inter | 11px | 600 | varies |

### Actual (Código)
- Usa Geist como fuente principal
- Plus Jakarta Sans definida pero poco usada
- Inter no configurada

**Acción:**
- Añadir Inter font
- Aplicar tipografía según especificaciones

---

## 7. Colores (Ya Implementados)

Los colores en `globals.css` ya están alineados con el diseño:
- Primary: #8B5CF6
- Secondary/Card: #F4F4F5
- Foreground: #18181B
- Muted-foreground: #71717A
- Border: #E4E4E7

**Sin cambios necesarios** en variables CSS.

---

## 8. Responsividad

### Diseño (Pencil)
- Referencia desktop: 1440x900px
- No hay diseño móvil explícito

### Estrategia Propuesta
- **Desktop (≥1024px):** Sidebar visible, layout completo
- **Tablet (768-1023px):** Sidebar colapsable con botón hamburger
- **Mobile (<768px):** Sidebar como drawer/overlay

**Acción:** Implementar comportamiento responsive
