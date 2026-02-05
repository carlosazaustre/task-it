# Especificaciones de Diseño

## Tokens de Diseño

### Colores

#### Colores Principales
| Token | Valor | Uso |
|-------|-------|-----|
| `--primary` | `#8B5CF6` | Violeta principal, CTAs, elementos activos |
| `--primary-foreground` | `#FFFFFF` | Texto sobre primary |
| `--background` | `#FFFFFF` | Fondo del main content |
| `--foreground` | `#18181B` | Texto principal |
| `--secondary` | `#F4F4F5` | Fondo sidebar, cards, inputs |
| `--muted-foreground` | `#71717A` | Texto secundario |
| `--border` | `#E4E4E7` | Bordes |
| `--accent` | `#8B5CF620` | Estados hover/activos con transparencia |

#### Colores de Tags (Categorías)
| Categoría | Color | Background |
|-----------|-------|------------|
| Trabajo | `#F59E0B` | `#F59E0B20` |
| Personal | `#3B82F6` | `#3B82F620` |
| Urgente | `#EF4444` | `#EF444420` |
| Reunión | `#8B5CF6` | `#8B5CF620` |
| Idea | `#22C55E` | `#22C55E20` |

#### Colores de Estado
| Estado | Color |
|--------|-------|
| Pendiente | `#F59E0B` (amber) |
| En progreso | `#3B82F6` (blue) |
| Completado | `#22C55E` (green) |

---

### Tipografía

#### Fuentes
| Variable | Fuente | Fallback |
|----------|--------|----------|
| `--font-jakarta` | Plus Jakarta Sans | sans-serif |
| `--font-inter` | Inter | sans-serif |
| `--font-geist-sans` | Geist Sans | sans-serif |

#### Escala Tipográfica
| Elemento | Font | Size | Weight | Line Height |
|----------|------|------|--------|-------------|
| Logo | Plus Jakarta Sans | 20px | 700 | 1.2 |
| Título página | Plus Jakarta Sans | 34px | 700 | 1.1 |
| Subtítulo página | Inter | 14px | 400 | 1.4 |
| Nav item | Inter | 14px | 500/600 | 1.4 |
| Task título | Inter | 16px | 600 | 1.3 |
| Task meta | Inter | 13px | 400 | 1.4 |
| Filter chip | Inter | 13px | 500/600 | 1 |
| Tag badge | Inter | 11px | 600 | 1 |
| Fecha pequeña | Inter | 12px | 500 | 1 |

---

### Espaciado

#### Padding del Layout
| Área | Padding |
|------|---------|
| Sidebar | 28px vertical, 20px horizontal |
| Main Content | 40px vertical, 48px horizontal |
| Task Card | 20px |

#### Gaps
| Contexto | Gap |
|----------|-----|
| Logo (icono-texto) | 12px |
| Nav items | 8px |
| Nav item (icono-label) | 12px |
| User profile (avatar-info) | 12px |
| Header (title-subtitle) | 4px |
| Header (search-button) | 12px |
| Filter chips | 12px |
| Task list | 12px |
| Task card (checkbox-content) | 16px |
| Task card (content lines) | 2px |
| Task card right (tag-date) | 8px |

---

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | 14px | Nav items, inputs, checkboxes pequeños |
| `--radius-md` | 20px | Filter chips, avatares |
| `--radius-lg` | 24px | Cards, botones grandes, search box |
| `--radius-full` | 50% | Avatares circulares, checkboxes |

#### Aplicaciones Específicas
| Elemento | Radius |
|----------|--------|
| Logo mark | 10px |
| Nav item | 14px |
| Avatar | 20px (circular 40px) |
| Search box | 26px |
| Add button | 24px |
| Filter chip | 20px |
| Task card | 24px |
| Status checkbox | 14px (full circle) |
| Tag badge | 12px |

---

### Dimensiones

#### Sidebar
| Elemento | Dimensión |
|----------|-----------|
| Ancho total | 260px |
| Logo mark | 32x32px |
| Nav item height | ~44px (padding based) |
| Avatar | 40x40px |

#### Main Content
| Elemento | Dimensión |
|----------|-----------|
| Search box | 320px ancho, 52px alto |
| Add button | auto x ~44px |
| Task card | 100% ancho, auto alto |
| Status checkbox | 28x28px |

#### Iconos
| Contexto | Tamaño |
|----------|--------|
| Logo icon | 18px |
| Nav icons | 20px |
| Search icon | 20px |
| Button icons | 20px |
| Checkbox check | 16px |

---

### Sombras

#### Cards
```css
/* Default */
box-shadow: none;

/* Hover */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
```

#### Botón Primary
```css
/* Default */
box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);

/* Hover */
box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
```

---

### Transiciones

```css
/* Standard */
transition: all 0.2s ease-in-out;

/* Hover states */
transition: background-color 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s;
```

---

### Estados Interactivos

#### Nav Item
| Estado | Background | Text Color | Icon Color |
|--------|------------|------------|------------|
| Default | transparent | #71717A | #71717A |
| Hover | transparent | #71717A | #71717A |
| Active | #8B5CF6 | #FFFFFF | #FFFFFF |

#### Filter Chip
| Estado | Background | Text Color |
|--------|------------|------------|
| Default | #F4F4F5 | #71717A |
| Hover | #E4E4E7 | #71717A |
| Selected | #8B5CF620 | #8B5CF6 |

#### Task Card
| Estado | Background | Shadow | Transform |
|--------|------------|--------|-----------|
| Default | #F4F4F5 | none | none |
| Hover | #F4F4F5 | md | translateY(-1px) |
| Completed | #F4F4F5 | none | none + opacity 0.6 |

#### Status Checkbox
| Estado | Background | Border | Icon |
|--------|------------|--------|------|
| Unchecked | transparent | 2px #E4E4E7 | none |
| Unchecked Hover | transparent | 2px #8B5CF6 | none |
| Checked | #8B5CF6 | none | check white |

---

### Breakpoints

| Nombre | Valor | Layout |
|--------|-------|--------|
| Mobile | < 768px | Sidebar drawer |
| Tablet | 768px - 1023px | Sidebar colapsable |
| Desktop | ≥ 1024px | Sidebar visible |

---

## Iconos Lucide Usados

```typescript
import {
  Check,           // Logo, checkbox
  LayoutDashboard, // Nav - Dashboard
  ListTodo,        // Nav - Mis Tareas
  Calendar,        // Nav - Calendario
  Settings,        // Nav - Ajustes
  Search,          // Barra búsqueda
  Plus,            // Botón añadir
  Menu,            // Hamburger (mobile)
  X,               // Cerrar
} from 'lucide-react';
```

---

## Código CSS de Referencia

### Variables CSS Completas
```css
:root {
  /* Colores ya definidos en globals.css */

  /* Añadir si no existen */
  --font-jakarta: 'Plus Jakarta Sans', sans-serif;
  --font-inter: 'Inter', sans-serif;
}
```

### Clases Utilitarias Nuevas
```css
/* Layout */
.sidebar { /* definido en componente */ }

/* Typography */
.text-heading {
  font-family: var(--font-jakarta);
  font-weight: 700;
}

/* Cards V3 */
.card-v3 {
  background: var(--card);
  border-radius: 24px;
  padding: 20px;
}

/* Filter Chips */
.chip {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.chip-active {
  background: var(--accent);
  color: var(--primary);
  font-weight: 600;
}

.chip-inactive {
  background: var(--secondary);
  color: var(--muted-foreground);
}
```
