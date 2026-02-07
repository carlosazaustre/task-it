'use client';

import { CALENDAR_VIEWS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { CalendarViewType } from '@/lib/types';

interface ViewSwitcherProps {
  value: CalendarViewType;
  onChange: (view: CalendarViewType) => void;
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <div className="bg-secondary rounded-[26px] p-1 flex">
      {CALENDAR_VIEWS.map((view) => (
        <button
          key={view.value}
          type="button"
          onClick={() => onChange(view.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            value === view.value
              ? 'bg-primary text-white rounded-[22px]'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={value === view.value}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
