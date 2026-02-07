'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CalendarNavigationProps {
  periodLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarNavigation({
  periodLabel,
  onPrev,
  onNext,
  onToday,
}: CalendarNavigationProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        className="w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors"
        aria-label="Período anterior"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-base font-semibold text-foreground min-w-[200px] text-center">
        {periodLabel}
      </span>

      <button
        type="button"
        onClick={onNext}
        className="w-9 h-9 rounded-full bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors"
        aria-label="Período siguiente"
      >
        <ChevronRight size={18} />
      </button>

      <Button variant="primary" size="sm" onClick={onToday}>
        Hoy
      </Button>
    </div>
  );
}
