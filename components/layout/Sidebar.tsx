'use client';

import { usePathname } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { NavItem } from './NavItem';
import { UserProfile } from './UserProfile';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  isOpen = false,
  onClose,
}: SidebarProps) {
  const currentPath = usePathname();

  return (
    <aside
      className={`
        w-[260px] h-screen bg-secondary
        flex flex-col justify-between
        py-7 px-5
        fixed lg:static top-0 left-0 z-50
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `.trim().replace(/\s+/g, ' ')}
    >
      {/* Header con Logo y boton cerrar en mobile */}
      <div>
        <div className="flex items-center justify-between mb-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center">
              <Check className="w-[18px] h-[18px] text-white" strokeWidth={3} />
            </div>
            <span className="text-xl font-bold text-foreground font-heading">
              Task-It
            </span>
          </div>

          {/* Boton cerrar (solo mobile) */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-background/50 rounded-lg transition-colors"
              aria-label="Cerrar menu"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <NavItem
            icon="layout-dashboard"
            label="Dashboard"
            href="/analytics"
            active={currentPath === '/analytics'}
          />
          <NavItem
            icon="list-todo"
            label="Mis Tareas"
            href="/"
            active={currentPath === '/'}
          />
          <NavItem
            icon="calendar"
            label="Calendario"
            href="/calendar"
            active={currentPath === '/calendar'}
          />
          <NavItem
            icon="timer"
            label="Pomodoro"
            href="/pomodoro"
            active={currentPath === '/pomodoro'}
          />
          <NavItem
            icon="settings"
            label="Ajustes"
            href="/settings"
            active={currentPath === '/settings'}
          />
        </nav>
      </div>

      {/* Theme Toggle + User Profile */}
      <div className="pt-4 border-t border-border space-y-4">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>

        {/* User Profile */}
        <UserProfile />
      </div>
    </aside>
  );
}
