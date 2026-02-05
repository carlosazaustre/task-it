<p align="center">
  <img src="docs/screenshots/logo.svg" alt="Task-It Logo" width="80" height="80">
</p>

<h1 align="center">Task-It</h1>

<p align="center">
  <strong>Gestiona y organiza tus tareas laborales de forma simple y elegante</strong>
</p>

<p align="center">
  <a href="#-características">Características</a> •
  <a href="#-capturas-de-pantalla">Capturas</a> •
  <a href="#-instalación">Instalación</a> •
  <a href="#-uso">Uso</a> •
  <a href="#-stack-tecnológico">Stack</a> •
  <a href="#-estructura-del-proyecto">Estructura</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS">
</p>

---

## 📋 Descripción

**Task-It** es una aplicación web de gestión de tareas diseñada para profesionales que necesitan organizar sus pendientes laborales de manera eficiente. Con un diseño minimalista y vibrante, Task-It te permite:

- Crear, editar y eliminar tareas fácilmente
- Organizar tareas por categorías con etiquetas de colores
- Filtrar tareas por estado, prioridad o etiqueta
- Cambiar entre tema claro y oscuro según tu preferencia
- Trabajar offline gracias al almacenamiento local

El proyecto sigue un enfoque **MVP** (Minimum Viable Product), priorizando funcionalidad esencial sobre características superfluas.

---

## ✨ Características

### Gestión de Tareas
- **Crear tareas** con título, descripción, fecha límite y prioridad
- **Editar tareas** existentes mediante un modal intuitivo
- **Eliminar tareas** con confirmación para evitar errores
- **Cambiar estado** con un solo click en el checkbox circular

### Estados de Tarea
| Estado | Color | Descripción |
|--------|-------|-------------|
| 🟡 Pendiente | Amarillo | Tarea sin comenzar |
| 🔵 En Progreso | Azul | Tarea en desarrollo |
| 🟢 Completada | Verde | Tarea finalizada |

### Prioridades
| Prioridad | Color | Uso |
|-----------|-------|-----|
| 🔴 Alta | Rojo | Tareas urgentes |
| 🟠 Media | Naranja | Tareas importantes |
| ⚪ Baja | Gris | Tareas secundarias |

### Etiquetas Personalizadas
Organiza tus tareas con etiquetas de colores:
- Trabajo, Personal, Urgente, Reunión, Idea
- Crea tus propias etiquetas con colores personalizados

### Filtrado Avanzado
- **Búsqueda** por título o descripción
- **Filtros rápidos** mediante chips de categoría
- **Combinación** de múltiples filtros

### Tema Claro/Oscuro
- Soporte completo para **tema claro** y **oscuro**
- Opción de seguir el tema del **sistema operativo**
- Transiciones suaves entre temas
- Persistencia de preferencia en localStorage

### Diseño Responsivo
- **Desktop**: Sidebar fijo con navegación completa
- **Tablet**: Sidebar colapsable
- **Mobile**: Sidebar como drawer lateral

---

## 📸 Capturas de Pantalla

### Vista Principal (Tema Claro)
La interfaz principal muestra el sidebar de navegación a la izquierda y la lista de tareas a la derecha.

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌─────────────────────────────────────┐  │
│  │   Task-It    │  │  Mis Tareas                         │  │
│  │              │  │  Gestiona y organiza tus tareas     │  │
│  │  Dashboard   │  │                                     │  │
│  │  Mis Tareas  │  │  [Todas] [Trabajo] [Personal] ...   │  │
│  │  Calendario  │  │                                     │  │
│  │  Ajustes     │  │  ┌─────────────────────────────┐    │  │
│  │              │  │  │ ○ Revisar propuesta diseño  │    │  │
│  │              │  │  │   Trabajo · Hoy, 10:00 AM   │    │  │
│  │              │  │  └─────────────────────────────┘    │  │
│  │              │  │                                     │  │
│  │  ────────    │  │  ┌─────────────────────────────┐    │  │
│  │  🌙 Tema     │  │  │ ○ Preparar presentación Q1  │    │  │
│  │  👤 Juan D.  │  │  │   Trabajo · Mañana, 9:00    │    │  │
│  └──────────────┘  │  └─────────────────────────────┘    │  │
│                    └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Modal de Nueva Tarea
Formulario completo para crear o editar tareas.

```
┌────────────────────────────────────┐
│  Nueva Tarea                    ✕  │
├────────────────────────────────────┤
│                                    │
│  Título                            │
│  ┌──────────────────────────────┐  │
│  │ Nombre de la tarea           │  │
│  └──────────────────────────────┘  │
│                                    │
│  Descripción                       │
│  ┌──────────────────────────────┐  │
│  │ Describe la tarea...         │  │
│  └──────────────────────────────┘  │
│                                    │
│  Estado          Prioridad         │
│  [Pendiente ▼]   [Media ▼]         │
│                                    │
│  Fecha Límite                      │
│  ┌──────────────────────────────┐  │
│  │ Seleccionar fecha         📅 │  │
│  └──────────────────────────────┘  │
│                                    │
│  Etiquetas                         │
│  [Trabajo] [Personal] [Urgente]    │
│                                    │
├────────────────────────────────────┤
│        [Cancelar]  [✓ Crear]       │
└────────────────────────────────────┘
```

### Archivo de Diseño
El diseño completo está disponible en Pencil.app:
- **Archivo**: `docs/design/task-it.pen`
- **Frame principal**: "Task Manager App V3 - Minimal Vibrant"

---

## 🚀 Instalación

### Prerrequisitos

- **Node.js** 18.17 o superior
- **npm** 9+ o **yarn** 1.22+ o **pnpm** 8+

### Pasos de Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/task-it.git
   cd task-it
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abre la aplicación**

   Navega a [http://localhost:3000](http://localhost:3000) en tu navegador.

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con hot-reload |
| `npm run build` | Genera la build de producción optimizada |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint para verificar el código |

---

## 📖 Uso

### Crear una Tarea

1. Haz click en el botón **"+ Nueva Tarea"** en la esquina superior derecha
2. Completa el formulario:
   - **Título**: Nombre descriptivo de la tarea (obligatorio)
   - **Descripción**: Detalles adicionales (opcional)
   - **Estado**: Pendiente, En Progreso o Completada
   - **Prioridad**: Alta, Media o Baja
   - **Fecha límite**: Cuándo debe completarse
   - **Etiquetas**: Categorías para organizar
3. Click en **"Crear Tarea"**

### Editar una Tarea

1. Haz click en cualquier parte de la tarjeta de tarea
2. Se abrirá el modal con los datos actuales
3. Modifica los campos necesarios
4. Click en **"Guardar Cambios"**

### Cambiar Estado de una Tarea

- Haz click en el **checkbox circular** a la izquierda de la tarea
- El estado ciclará: Pendiente → En Progreso → Completada → Pendiente

### Filtrar Tareas

**Por categoría (chips)**:
- Click en los chips de filtro: "Todas", "Trabajo", "Personal", etc.

**Por búsqueda**:
- Escribe en la barra de búsqueda del header
- La búsqueda filtra por título y descripción

### Cambiar Tema

1. En el **Sidebar**, busca la sección "Tema"
2. Haz click en el botón de sol/luna para ciclar entre:
   - ☀️ **Claro**: Fondo blanco, ideal para el día
   - 🌙 **Oscuro**: Fondo oscuro, reduce fatiga visual
   - 💻 **Sistema**: Sigue la preferencia del SO

---

## 🛠 Stack Tecnológico

### Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| [Next.js](https://nextjs.org/) | 16 | Framework React con App Router |
| [React](https://react.dev/) | 19 | Biblioteca de UI |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Tipado estático |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Estilos utility-first |
| [Lucide React](https://lucide.dev/) | latest | Iconos SVG |

### Arquitectura

- **App Router**: Rutas basadas en el sistema de archivos de Next.js 13+
- **Client Components**: Para interactividad y estado local
- **CSS Variables**: Sistema de temas con variables CSS nativas
- **localStorage**: Persistencia de datos sin backend

### Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| ESLint | Linting de código |
| PostCSS | Procesamiento de CSS |
| Turbopack | Bundler de desarrollo (Next.js 16) |

---

## 📁 Estructura del Proyecto

```
task-it/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Layout raíz con fuentes y tema
│   ├── page.tsx                  # Página principal
│   └── globals.css               # Variables CSS y estilos globales
│
├── components/
│   ├── layout/                   # Componentes de estructura
│   │   ├── Sidebar.tsx           # Barra lateral con navegación
│   │   ├── PageHeader.tsx        # Header con título y búsqueda
│   │   ├── NavItem.tsx           # Item de navegación
│   │   ├── UserProfile.tsx       # Perfil de usuario
│   │   └── index.ts              # Exports
│   │
│   ├── task/                     # Componentes de tareas
│   │   ├── TaskCard.tsx          # Tarjeta de tarea individual
│   │   ├── TaskList.tsx          # Lista de tareas
│   │   ├── TaskForm.tsx          # Formulario crear/editar
│   │   ├── FilterChips.tsx       # Filtros de categoría
│   │   ├── TaskStatusBadge.tsx   # Badge de estado
│   │   ├── TaskPriorityBadge.tsx # Badge de prioridad
│   │   └── ...
│   │
│   └── ui/                       # Componentes UI reutilizables
│       ├── Button.tsx            # Botón con variantes
│       ├── Modal.tsx             # Modal/Dialog
│       ├── Input.tsx             # Campo de texto
│       ├── Select.tsx            # Selector dropdown
│       ├── ThemeToggle.tsx       # Toggle de tema
│       └── ...
│
├── hooks/                        # Custom React Hooks
│   ├── useTasks.ts               # CRUD de tareas
│   ├── useTags.ts                # Gestión de etiquetas
│   ├── useTaskFilters.ts         # Lógica de filtrado
│   └── useTheme.ts               # Estado del tema
│
├── lib/                          # Utilidades y tipos
│   ├── types.ts                  # Tipos TypeScript
│   ├── constants.ts              # Constantes de la app
│   └── utils.ts                  # Funciones helper
│
├── docs/
│   ├── design/                   # Archivos de diseño
│   │   └── task-it.pen           # Diseño en Pencil.app
│   └── plan/                     # Documentación del plan
│
└── public/                       # Assets estáticos
```

---

## 🎨 Sistema de Diseño

### Colores

#### Tema Claro
| Variable | Color | Uso |
|----------|-------|-----|
| `--background` | `#FFFFFF` | Fondo principal |
| `--foreground` | `#18181B` | Texto principal |
| `--primary` | `#8B5CF6` | Acento violeta |
| `--secondary` | `#F4F4F5` | Fondos secundarios |
| `--muted-foreground` | `#71717A` | Texto secundario |

#### Tema Oscuro
| Variable | Color | Uso |
|----------|-------|-----|
| `--background` | `#18181B` | Fondo principal |
| `--foreground` | `#FAFAFA` | Texto principal |
| `--primary` | `#A78BFA` | Acento violeta claro |
| `--secondary` | `#27272A` | Fondos secundarios |

### Tipografía

| Fuente | Uso |
|--------|-----|
| Plus Jakarta Sans | Títulos y headings |
| Inter | Texto del cuerpo |
| Geist Mono | Código (si aplica) |

### Espaciado y Bordes

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | 14px | Inputs, nav items |
| `--radius-md` | 20px | Chips, avatares |
| `--radius-lg` | 24px | Cards, modales |

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
4. Push a tu rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Convenciones de Commits

```
feat(scope): add new feature
fix(scope): fix bug description
refactor(scope): code refactoring
docs: update documentation
chore: maintenance tasks
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- Diseño UI/UX creado con [Pencil.app](https://pencil.app)
- Iconos por [Lucide](https://lucide.dev)
- Fuentes por [Google Fonts](https://fonts.google.com) y [Vercel](https://vercel.com/font)

---

<p align="center">
  Hecho con 💜 usando Next.js y Tailwind CSS
</p>
