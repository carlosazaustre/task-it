# Componentes Nuevos a Crear

## 1. Sidebar (`components/layout/Sidebar.tsx`)

### Props
```typescript
interface SidebarProps {
  isOpen?: boolean;           // Para mobile
  onClose?: () => void;       // Para mobile
  currentPath?: string;       // Ruta activa (futuro)
  user?: {
    name: string;
    role: string;
    initials: string;
  };
}
```

### Estructura
```tsx
<aside className="sidebar">
  {/* Logo */}
  <div className="sidebar-logo">
    <div className="logo-mark">{/* Check icon */}</div>
    <span className="logo-text">Task-It</span>
  </div>

  {/* Navigation */}
  <nav className="sidebar-nav">
    <NavItem icon="layout-dashboard" label="Dashboard" active />
    <NavItem icon="list-todo" label="Mis Tareas" />
    <NavItem icon="calendar" label="Calendario" />
    <NavItem icon="settings" label="Ajustes" />
  </nav>

  {/* User Profile */}
  <div className="sidebar-user">
    <div className="user-avatar">{initials}</div>
    <div className="user-info">
      <span className="user-name">{name}</span>
      <span className="user-role">{role}</span>
    </div>
  </div>
</aside>
```

### Estilos Clave
```css
.sidebar {
  width: 260px;
  height: 100vh;
  background: var(--secondary);  /* #F4F4F5 */
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-item.active {
  background: var(--primary);  /* #8B5CF6 */
  color: white;
}

.nav-item:not(.active) {
  color: var(--muted-foreground);  /* #71717A */
}
```

### Dependencias
- `lucide-react` para iconos (ya instalado)

---

## 2. NavItem (`components/layout/NavItem.tsx`)

### Props
```typescript
interface NavItemProps {
  icon: string;          // Nombre del icono Lucide
  label: string;
  href?: string;         // Futuro: para routing
  active?: boolean;
  onClick?: () => void;
}
```

### Implementación Simple (MVP)
```tsx
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  Settings
} from 'lucide-react';

const ICONS = {
  'layout-dashboard': LayoutDashboard,
  'list-todo': ListTodo,
  'calendar': Calendar,
  'settings': Settings,
};

export function NavItem({ icon, label, active, onClick }: NavItemProps) {
  const Icon = ICONS[icon];

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-3.5 py-3 rounded-[14px]',
        'text-sm font-medium transition-all',
        active
          ? 'bg-primary text-white'
          : 'text-muted-foreground hover:bg-secondary/80'
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}
```

---

## 3. UserProfile (`components/layout/UserProfile.tsx`)

### Props
```typescript
interface UserProfileProps {
  name: string;
  role: string;
  initials: string;
  avatarUrl?: string;  // Futuro
}
```

### Implementación
```tsx
export function UserProfile({ name, role, initials }: UserProfileProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
        <span className="text-white text-sm font-semibold">{initials}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">{name}</span>
        <span className="text-xs text-muted-foreground">{role}</span>
      </div>
    </div>
  );
}
```

---

## 4. MainLayout (`components/layout/MainLayout.tsx`)

### Props
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
}
```

### Estructura
```tsx
export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar user={mockUser} />
      </div>

      {/* Sidebar - Mobile (drawer) */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <Sidebar isOpen onClose={() => setSidebarOpen(false)} user={mockUser} />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-background">
        {/* Mobile header with hamburger */}
        <div className="lg:hidden p-4 border-b">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
```

---

## 5. PageHeader (`components/layout/PageHeader.tsx`)

### Props
```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
}
```

### Estructura
```tsx
export function PageHeader({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  actions
}: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8">
      {/* Left side */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[34px] font-bold font-heading leading-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search box */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Buscar tareas..."
            className="w-80 h-[52px] pl-12 pr-5 bg-secondary rounded-[26px] text-sm"
          />
        </div>

        {/* Actions slot */}
        {actions}
      </div>
    </header>
  );
}
```

---

## 6. FilterChips (`components/task/FilterChips.tsx`)

### Props
```typescript
interface FilterChipsProps {
  options: Array<{
    value: string;
    label: string;
  }>;
  selected: string;
  onChange: (value: string) => void;
}
```

### Implementación
```tsx
export function FilterChips({ options, selected, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'py-2 px-4 rounded-[20px] text-[13px] font-medium transition-all',
            selected === option.value
              ? 'bg-[#8B5CF620] text-primary font-semibold'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

---

## Estructura de Carpetas Propuesta

```
components/
├── layout/
│   ├── Sidebar.tsx
│   ├── NavItem.tsx
│   ├── UserProfile.tsx
│   ├── MainLayout.tsx
│   ├── PageHeader.tsx
│   └── index.ts
├── task/
│   ├── TaskCard.tsx        (modificar)
│   ├── TaskList.tsx        (modificar)
│   ├── TaskFilters.tsx     (modificar → FilterChips.tsx)
│   ├── TaskForm.tsx        (sin cambios)
│   └── ...
└── ui/
    └── ...
```
