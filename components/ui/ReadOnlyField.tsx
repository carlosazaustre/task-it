'use client';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
}

export function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="px-4 py-3 rounded-[14px] bg-background text-sm font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}
