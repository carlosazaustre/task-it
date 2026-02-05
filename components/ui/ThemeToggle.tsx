'use client';

import { useTheme, type Theme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

const THEME_ORDER: Theme[] = ['system', 'light', 'dark'];

function getNextTheme(current: Theme): Theme {
  const currentIndex = THEME_ORDER.indexOf(current);
  const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
  return THEME_ORDER[nextIndex];
}

const THEME_LABELS: Record<Theme, string> = {
  system: 'Sistema',
  light: 'Claro',
  dark: 'Oscuro',
};

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleClick = () => {
    setTheme(getNextTheme(theme));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg',
        'min-h-[44px] min-w-[44px] p-2',
        'bg-secondary border border-border',
        'hover:bg-secondary/50 transition-all',
        'focus:outline-none focus:ring-2 focus:ring-ring'
      )}
      aria-label={`Cambiar tema. Actual: ${THEME_LABELS[theme]}`}
      title={`Tema: ${THEME_LABELS[theme]}`}
    >
      {/* Sun icon - shown when resolved theme is light */}
      <svg
        className={cn(
          'w-5 h-5 transition-all',
          resolvedTheme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90 absolute'
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Moon icon - shown when resolved theme is dark */}
      <svg
        className={cn(
          'w-5 h-5 transition-all',
          resolvedTheme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90 absolute'
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      {/* System indicator dot */}
      {theme === 'system' && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
