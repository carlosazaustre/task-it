'use client';

import { ViewSwitcher } from './ViewSwitcher';
import { CalendarNavigation } from './CalendarNavigation';
import type { CalendarViewType } from '@/lib/types';

interface CalendarHeaderProps {
  title: string;
  subtitle: string;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  periodLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  title,
  subtitle,
  view,
  onViewChange,
  periodLabel,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Row 1: Title + ViewSwitcher */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-[34px] font-bold font-heading leading-tight text-foreground">
          {title}
        </h1>
        <ViewSwitcher value={view} onChange={onViewChange} />
      </div>

      {/* Row 2: Subtitle + CalendarNavigation */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <CalendarNavigation
          periodLabel={periodLabel}
          onPrev={onPrev}
          onNext={onNext}
          onToday={onToday}
        />
      </div>
    </div>
  );
}
