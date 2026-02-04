# Especificación: Componentes UI Base

## Ubicación
`components/ui/`

Componentes reutilizables y genéricos que forman el sistema de diseño.

---

## Button

**Archivo:** `Button.tsx`

Botón reutilizable con múltiples variantes.

### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

### Variantes

| Variante | Uso | Estilos |
|----------|-----|---------|
| `primary` | Acción principal | bg-blue-600, text-white |
| `secondary` | Acción secundaria | bg-gray-200, text-gray-800 |
| `danger` | Acción destructiva | bg-red-600, text-white |
| `ghost` | Acción sutil | transparent, text-gray-600 |

### Tamaños

| Tamaño | Padding | Font Size |
|--------|---------|-----------|
| `sm` | px-3 py-1.5 | text-sm |
| `md` | px-4 py-2 | text-base |
| `lg` | px-6 py-3 | text-lg |

### Comportamiento
- Estado `disabled`: opacity-50, cursor-not-allowed
- Estado `isLoading`: muestra spinner, deshabilitado
- Hover/focus: estados visuales claros
- Soporte completo para atributos nativos de button

---

## Input

**Archivo:** `Input.tsx`

Campo de texto con soporte para estados de error y labels.

### Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}
```

### Estados Visuales

| Estado | Estilos |
|--------|---------|
| Default | border-gray-300 |
| Focus | border-blue-500, ring-2 ring-blue-200 |
| Error | border-red-500, ring-2 ring-red-200 |
| Disabled | bg-gray-100, cursor-not-allowed |

### Estructura

```
<label>
  <span>{label}</span>
  <input ... />
  {hint && <span class="hint">{hint}</span>}
  {error && <span class="error">{error}</span>}
</label>
```

---

## Textarea

**Archivo:** `Textarea.tsx`

Área de texto multilínea con las mismas características que Input.

### Props

```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}
```

---

## Select

**Archivo:** `Select.tsx`

Selector desplegable nativo estilizado.

### Props

```typescript
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}
```

---

## Badge

**Archivo:** `Badge.tsx`

Etiqueta visual para mostrar estados, categorías o contadores.

### Props

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  color?: string;  // Color Tailwind personalizado
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
}
```

### Variantes Predefinidas

| Variante | Color de Fondo | Color de Texto |
|----------|----------------|----------------|
| `default` | gray-100 | gray-800 |
| `success` | green-100 | green-800 |
| `warning` | amber-100 | amber-800 |
| `error` | red-100 | red-800 |
| `info` | blue-100 | blue-800 |

### Comportamiento
- `removable`: muestra icono X clickeable
- `onRemove`: callback al hacer click en X

---

## Modal

**Archivo:** `Modal.tsx`

Diálogo modal con backdrop y gestión de focus.

### Props

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}
```

### Tamaños

| Tamaño | Max Width |
|--------|-----------|
| `sm` | max-w-sm (384px) |
| `md` | max-w-md (448px) |
| `lg` | max-w-lg (512px) |

### Comportamiento
- Backdrop semi-transparente (bg-black/50)
- Centrado vertical y horizontal
- Cierra con Escape (si `closeOnEscape`)
- Cierra al click en backdrop (si `closeOnBackdrop`)
- Trap de focus dentro del modal
- Animación de entrada/salida (fade + scale)
- Previene scroll del body cuando está abierto

### Estructura

```
<div class="backdrop">
  <div class="modal-content">
    <header>
      <h2>{title}</h2>
      <button onClick={onClose}>✕</button>
    </header>
    <div class="modal-body">
      {children}
    </div>
  </div>
</div>
```

---

## EmptyState

**Archivo:** `EmptyState.tsx`

Mensaje para cuando no hay contenido que mostrar.

### Props

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### Estructura

```
<div class="empty-state">
  {icon}
  <h3>{title}</h3>
  {description && <p>{description}</p>}
  {action && <Button onClick={action.onClick}>{action.label}</Button>}
</div>
```

---

## Spinner

**Archivo:** `Spinner.tsx`

Indicador de carga animado.

### Props

```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}
```

### Tamaños

| Tamaño | Dimensiones |
|--------|-------------|
| `sm` | w-4 h-4 |
| `md` | w-6 h-6 |
| `lg` | w-8 h-8 |

---

## Accesibilidad

Todos los componentes deben cumplir:

- **Button**: `role="button"`, estados aria-disabled, aria-busy
- **Input/Textarea**: aria-invalid, aria-describedby para errores
- **Select**: Labels asociados correctamente
- **Badge**: role="status" cuando sea relevante
- **Modal**: role="dialog", aria-modal, aria-labelledby, focus trap
- **EmptyState**: role="status"
- **Spinner**: role="status", aria-label="Cargando"

## Responsive

- Todos los componentes son responsive por defecto
- Mobile-first: diseñados para funcionar en pantallas pequeñas
- Touch-friendly: áreas de click mínimas de 44x44px
