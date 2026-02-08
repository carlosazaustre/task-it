'use client';

import { useTheme, type Theme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { THEME_OPTIONS } from '@/lib/constants';

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
      role="radio"
      aria-checked={isActive}
      aria-label={`Tema ${label}`}
    >
      <ThemePreview theme={theme} />
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
    // Preview of dark theme using CSS variable approach
    // Use inline styles since Tailwind doesn't generate dark-mode preview styles
    return (
      <div
        className="h-12 rounded-[10px] flex flex-col justify-center gap-1 px-2.5"
        style={{
          backgroundColor: 'var(--secondary)',
          color: 'var(--border)',
        }}
      >
        <div className="w-[60px] h-1 rounded-sm" style={{ backgroundColor: 'var(--muted-foreground)' }} />
        <div className="w-10 h-1 rounded-sm opacity-60" style={{ backgroundColor: 'var(--muted-foreground)' }} />
      </div>
    );
  }

  // System theme preview (split light/dark)
  return (
    <div className="h-12 rounded-[10px] flex overflow-hidden">
      <div className="flex-1 bg-secondary flex flex-col justify-center gap-1 px-2.5">
        <div className="w-[30px] h-1 rounded-sm bg-border" />
        <div className="w-5 h-1 rounded-sm bg-border/60" />
      </div>
      <div
        className="flex-1 flex flex-col justify-center items-end gap-1 px-2.5"
        style={{
          backgroundColor: 'var(--secondary)',
          color: 'var(--border)',
        }}
      >
        <div className="w-[30px] h-1 rounded-sm" style={{ backgroundColor: 'var(--muted-foreground)' }} />
        <div className="w-5 h-1 rounded-sm opacity-60" style={{ backgroundColor: 'var(--muted-foreground)' }} />
      </div>
    </div>
  );
}
