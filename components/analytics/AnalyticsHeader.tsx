'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronDown, Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { ANALYTICS_DATE_RANGES } from '@/lib/constants';
import type { AnalyticsDateRange } from '@/lib/types';

interface AnalyticsHeaderProps {
  dateRange: AnalyticsDateRange;
  onDateRangeChange: (range: AnalyticsDateRange) => void;
}

export function AnalyticsHeader({ dateRange, onDateRangeChange }: AnalyticsHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = ANALYTICS_DATE_RANGES.find(r => r.value === dateRange)?.label ?? 'Esta semana';

  return (
    <PageHeader
      title="Dashboard"
      subtitle="Resumen de tu productividad y progreso"
      showSearch={false}
      actions={
        <div className="flex items-center gap-3">
          {/* Date Range Picker */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              className="flex items-center gap-2 bg-secondary rounded-[24px] px-[18px] py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              {currentLabel}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-[14px] shadow-lg py-2 z-10 min-w-[200px]"
                   role="listbox"
                   aria-label="Seleccionar rango de fechas">
                {ANALYTICS_DATE_RANGES.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onDateRangeChange(option.value);
                      setIsOpen(false);
                    }}
                    role="option"
                    aria-selected={option.value === dateRange}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      option.value === dateRange
                        ? 'text-primary font-semibold bg-primary/5'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Button (disabled for MVP) */}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            disabled
            title="Disponible próximamente"
          >
            Exportar
          </Button>
        </div>
      }
    />
  );
}
