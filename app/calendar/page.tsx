'use client';

import { Suspense } from 'react';
import { AppShell } from '@/components/layout';
import { CalendarView } from '@/components/calendar';

function CalendarSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4">
        <div className="h-10 bg-secondary rounded-[14px] w-48" />
        <div className="h-5 bg-secondary rounded-[14px] w-72" />
      </div>
      {/* Grid skeleton */}
      <div className="bg-card rounded-[16px] border border-border h-[500px]" />
    </div>
  );
}

export default function CalendarPage() {
  return (
    <AppShell>
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarView />
      </Suspense>
    </AppShell>
  );
}
