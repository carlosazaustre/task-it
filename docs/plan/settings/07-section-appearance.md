# Spec 07: Seccion Apariencia

**Archivo:** `components/settings/SettingsAppearance.tsx` (NUEVO)
**Accion:** Crear
**Dependencias:** 05-hook-useSettings (indirecta: usa `useTheme` existente)
**Bloquea:** 12-orchestrator

---

## Referencia visual (del diseno Settings V3)

- Card con `bg-card rounded-[24px] p-7`
- Titulo "Apariencia" (Plus Jakarta Sans 20px bold)
- Label "Tema" (texto 12px muted)
- 3 tarjetas de seleccion de tema en fila horizontal, igual ancho:
  - **Claro**: Preview con fondo claro (#F4F4F5), lineas grises. Radio button seleccionado (dot violeta). Label "Claro"
  - **Oscuro**: Preview con fondo oscuro (#27272A), lineas oscuras. Radio sin seleccionar. Label "Oscuro"
  - **Sistema**: Preview mitad claro / mitad oscuro. Radio sin seleccionar. Label "Sistema"
- La tarjeta activa tiene `border-2 border-primary`

## Comportamiento

- Usa el hook existente `useTheme()` (no `useSettings`)
- Al hacer clic en una tarjeta, se cambia el tema inmediatamente
- La tarjeta activa muestra borde violeta y radio button relleno

## Implementacion

```tsx
'use client';

import { useTheme, type Theme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Sistema' },
];

export function SettingsAppearance() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="bg-card rounded-[24px] p-7 flex flex-col gap-6">
      <h2 className="text-xl font-bold text-foreground font-heading">
        Apariencia
      </h2>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-muted-foreground">Tema</span>

        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((option) => (
            <ThemeCard
              key={option.value}
              theme={option.value}
              label={option.label}
              isActive={theme === option.value}
              onClick={() => setTheme(option.value)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ThemeCard({
  theme,
  label,
  isActive,
  onClick,
}: {
  theme: Theme;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col gap-2.5 p-3.5 rounded-[16px] bg-background transition-all',
        isActive
          ? 'ring-2 ring-primary'
          : 'ring-1 ring-border hover:ring-primary/40'
      )}
    >
      {/* Preview */}
      <ThemePreview theme={theme} />

      {/* Label + Radio */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'w-4 h-4 rounded-full border-2 flex items-center justify-center',
            isActive ? 'border-primary' : 'border-border'
          )}
        >
          {isActive && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </div>
        <span
          className={cn(
            'text-[13px]',
            isActive ? 'font-semibold text-foreground' : 'font-medium text-foreground'
          )}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

function ThemePreview({ theme }: { theme: Theme }) {
  if (theme === 'light') {
    return (
      <div className="h-12 rounded-[10px] bg-secondary flex flex-col justify-center gap-1 px-2.5">
        <div className="w-[60px] h-1 rounded-sm bg-border" />
        <div className="w-10 h-1 rounded-sm bg-border/60" />
      </div>
    );
  }

  if (theme === 'dark') {
    return (
      <div className="h-12 rounded-[10px] bg-zinc-800 flex flex-col justify-center gap-1 px-2.5">
        <div className="w-[60px] h-1 rounded-sm bg-zinc-600" />
        <div className="w-10 h-1 rounded-sm bg-zinc-700" />
      </div>
    );
  }

  // System: mitad claro / mitad oscuro
  return (
    <div className="h-12 rounded-[10px] flex overflow-hidden">
      <div className="flex-1 bg-secondary flex flex-col justify-center gap-1 px-2.5">
        <div className="w-[30px] h-1 rounded-sm bg-border" />
        <div className="w-5 h-1 rounded-sm bg-border/60" />
      </div>
      <div className="flex-1 bg-zinc-800 flex flex-col justify-center items-end gap-1 px-2.5">
        <div className="w-[30px] h-1 rounded-sm bg-zinc-600" />
        <div className="w-5 h-1 rounded-sm bg-zinc-700" />
      </div>
    </div>
  );
}
```

## Verificacion

- Se renderiza con 3 tarjetas de tema
- La tarjeta activa tiene borde violeta y radio relleno
- Al hacer clic en una tarjeta, el tema cambia inmediatamente
- La preview de cada tarjeta muestra el aspecto visual correcto
- No se usa useTheme del Sidebar, ya que este componente es independiente
