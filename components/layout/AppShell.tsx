'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Backdrop mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 bg-background">
        {/* Mobile header con hamburguesa */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-[14px] hover:bg-secondary transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-lg font-bold font-heading text-foreground">Task-It</span>
        </div>

        <div className="p-6 lg:p-10 xl:px-12 xl:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
