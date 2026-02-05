'use client';

import { cn } from '@/lib/utils';

interface FilterChipsProps {
  options: Array<{
    value: string;
    label: string;
  }>;
  selected: string;
  onChange: (value: string) => void;
}

/**
 * FilterChips - Component for filtering tasks by categories
 *
 * Displays a horizontal row of selectable filter chips that toggle between
 * active and inactive states. Used in task listings to quickly filter by
 * category (Todas, Trabajo, Personal, Urgente, Reunión, Idea).
 *
 * @example
 * const filterOptions = [
 *   { value: 'all', label: 'Todas' },
 *   { value: 'work', label: 'Trabajo' },
 *   { value: 'personal', label: 'Personal' },
 * ];
 *
 * <FilterChips
 *   options={filterOptions}
 *   selected="all"
 *   onChange={(value) => setFilter(value)}
 * />
 */
export function FilterChips({ options, selected, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            // Base styles: layout, spacing, typography
            'py-2 px-4 rounded-[20px] text-[13px] font-medium transition-all',
            // Active state: primary background with transparency, primary text, semibold weight
            selected === option.value
              ? 'bg-primary/20 text-primary font-semibold'
              : // Inactive state: secondary background, muted text, with hover effect
                'bg-secondary text-muted-foreground hover:bg-secondary/80'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
