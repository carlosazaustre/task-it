import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  Settings,
} from 'lucide-react';

type IconName = 'layout-dashboard' | 'list-todo' | 'calendar' | 'settings';

const ICONS: Record<IconName, React.ComponentType<{ className?: string }>> = {
  'layout-dashboard': LayoutDashboard,
  'list-todo': ListTodo,
  'calendar': Calendar,
  'settings': Settings,
};

interface NavItemProps {
  icon: IconName;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

export function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  const Icon = ICONS[icon];

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full px-3.5 py-3
        text-sm font-medium transition-all
        ${active
          ? 'bg-primary text-white rounded-[14px]'
          : 'text-muted-foreground hover:text-foreground'
        }
      `.trim().replace(/\s+/g, ' ')}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </button>
  );
}
