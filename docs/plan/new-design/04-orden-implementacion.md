# Orden de Implementación

## Fase 1: Infraestructura de Layout

### 1.1 Configurar Fuentes
**Archivo:** `app/layout.tsx`

- [ ] Añadir fuente Inter desde `next/font/google`
- [ ] Configurar variable CSS `--font-inter`
- [ ] Verificar que Plus Jakarta Sans funciona correctamente

### 1.2 Crear Componentes Base de Layout
**Archivos nuevos:**
- [ ] `components/layout/index.ts` - Exports
- [ ] `components/layout/NavItem.tsx` - Item de navegación
- [ ] `components/layout/UserProfile.tsx` - Perfil de usuario
- [ ] `components/layout/Sidebar.tsx` - Barra lateral completa
- [ ] `components/layout/MainLayout.tsx` - Wrapper del layout

**Orden de creación:**
1. NavItem (más simple, sin dependencias)
2. UserProfile (simple, sin dependencias)
3. Sidebar (depende de NavItem y UserProfile)
4. MainLayout (depende de Sidebar)

### 1.3 Crear PageHeader
**Archivo:** `components/layout/PageHeader.tsx`

- [ ] Implementar estructura título + subtítulo + búsqueda + actions
- [ ] Aplicar estilos del diseño
- [ ] Hacer responsive (ocultar búsqueda en mobile si es necesario)

---

## Fase 2: Integración del Layout

### 2.1 Refactorizar page.tsx
**Archivo:** `app/page.tsx`

- [ ] Importar MainLayout y PageHeader
- [ ] Envolver contenido en MainLayout
- [ ] Reemplazar header actual por PageHeader
- [ ] Mover búsqueda del TaskFilters al PageHeader
- [ ] Ajustar padding del contenido principal

### 2.2 Crear FilterChips
**Archivo:** `components/task/FilterChips.tsx`

- [ ] Implementar componente de chips de filtro
- [ ] Definir opciones basadas en tags existentes
- [ ] Conectar con estado de filtros

### 2.3 Actualizar Sistema de Filtros
**Archivo:** `app/page.tsx` + hooks

- [ ] Decidir estrategia: filtrar por tag principal o mantener filtros actuales
- [ ] Adaptar lógica de useTaskFilters si es necesario
- [ ] Reemplazar TaskFilters por FilterChips en la vista

---

## Fase 3: Rediseño de Task Cards

### 3.1 Actualizar TaskCard
**Archivo:** `components/task/TaskCard.tsx`

- [ ] Cambiar layout de vertical a horizontal
- [ ] Implementar checkbox circular para status
- [ ] Simplificar estructura (quitar actions visibles)
- [ ] Ajustar estilos (corner radius, padding, colores)
- [ ] Añadir interacción: click para editar

### 3.2 Actualizar TaskList
**Archivo:** `components/task/TaskList.tsx`

- [ ] Cambiar de grid a flex vertical
- [ ] Ajustar gap entre cards

### 3.3 Helpers de Formato
**Archivo:** `lib/dateUtils.ts`

- [ ] Añadir `formatShortDate(date)`
- [ ] Añadir `formatTaskMeta(task)`
- [ ] Actualizar exports

---

## Fase 4: Pulido y Responsividad

### 4.1 Comportamiento Mobile del Sidebar
**Archivos:** `components/layout/MainLayout.tsx`, `Sidebar.tsx`

- [ ] Implementar sidebar como drawer en mobile
- [ ] Añadir botón hamburger
- [ ] Añadir overlay de fondo
- [ ] Animaciones de entrada/salida

### 4.2 Ajustes Responsive del Header
**Archivo:** `components/layout/PageHeader.tsx`

- [ ] Stack vertical en mobile
- [ ] Ocultar o reducir barra de búsqueda en mobile
- [ ] Ajustar tamaños de texto

### 4.3 Ajustes Responsive de Cards
**Archivo:** `components/task/TaskCard.tsx`

- [ ] Verificar que funciona bien en pantallas pequeñas
- [ ] Ajustar truncado de texto si es necesario

---

## Fase 5: Limpieza y Optimización

### 5.1 Eliminar Código No Usado
- [ ] Revisar TaskFilters original (mantener o eliminar)
- [ ] Eliminar estilos no usados en globals.css
- [ ] Revisar componentes huérfanos

### 5.2 Mover ThemeToggle
- [ ] Decidir nueva ubicación (Settings o Sidebar)
- [ ] Implementar si es en Sidebar

### 5.3 Testing Manual
- [ ] Verificar todas las interacciones
- [ ] Probar en diferentes viewports
- [ ] Verificar dark mode
- [ ] Probar creación/edición/eliminación de tareas

---

## Checklist de Verificación Final

### Funcionalidad
- [ ] Crear tarea funciona
- [ ] Editar tarea funciona
- [ ] Eliminar tarea funciona
- [ ] Cambiar status funciona (click en checkbox)
- [ ] Filtrar por categoría funciona
- [ ] Buscar funciona

### Diseño
- [ ] Layout coincide con diseño Pencil
- [ ] Colores correctos
- [ ] Tipografía correcta
- [ ] Espaciados correctos
- [ ] Border radius correcto
- [ ] Hover states funcionan

### Responsividad
- [ ] Desktop (≥1024px) - sidebar visible
- [ ] Tablet (768-1023px) - sidebar colapsable
- [ ] Mobile (<768px) - sidebar drawer

### Accesibilidad
- [ ] Navegación por teclado funciona
- [ ] Focus states visibles
- [ ] ARIA labels correctos
- [ ] Contraste de colores adecuado

---

## Dependencias Entre Fases

```
Fase 1 (Layout) ─────┐
                     ├──► Fase 2 (Integración) ──► Fase 3 (Cards) ──► Fase 4 (Responsive) ──► Fase 5 (Limpieza)
```

- Fase 1 es prerequisito para Fase 2
- Fase 3 puede hacerse en paralelo con Fase 2 (si se mantiene temporalmente el layout actual)
- Fase 4 depende de Fase 2 y 3
- Fase 5 es final

---

## Estimación de Complejidad

| Fase | Archivos | Complejidad | Notas |
|------|----------|-------------|-------|
| 1.1 | 1 | Baja | Config fuentes |
| 1.2 | 5 | Media | Componentes nuevos |
| 1.3 | 1 | Baja | Componente simple |
| 2.1 | 1 | Media | Refactor importante |
| 2.2 | 1 | Baja | Componente simple |
| 2.3 | 2 | Media | Lógica de filtros |
| 3.1 | 1 | Media-Alta | Rediseño completo |
| 3.2 | 1 | Baja | Cambio menor |
| 3.3 | 1 | Baja | Helpers |
| 4.x | 3 | Media | Responsive |
| 5.x | varios | Baja | Limpieza |
