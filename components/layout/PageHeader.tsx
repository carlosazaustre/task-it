'use client';

import { Search } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
  showSearch?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  searchValue = '',
  onSearchChange,
  actions,
  showSearch = true,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
      {/* Left side - Title & Subtitle */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[34px] font-bold font-heading leading-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side - Search & Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search box */}
        {showSearch && (
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Buscar tareas..."
              className="w-full h-[52px] pl-12 pr-5 bg-secondary text-foreground placeholder:text-muted-foreground rounded-[26px] text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>
        )}

        {/* Actions slot */}
        {actions}
      </div>
    </header>
  );
}
