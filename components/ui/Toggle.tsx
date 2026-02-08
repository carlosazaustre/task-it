'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
}: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'bg-primary' : 'bg-muted',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div
        className={cn(
          'absolute top-[3px] w-[18px] h-[18px] bg-background rounded-full transition-transform',
          checked ? 'translate-x-[23px]' : 'translate-x-[3px]'
        )}
      />
    </button>
  );
}

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  showBorder?: boolean;
}

export function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled = false,
  showBorder = false,
}: ToggleRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-3.5',
        showBorder && 'border-b border-border'
      )}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        ariaLabel={title}
      />
    </div>
  );
}
