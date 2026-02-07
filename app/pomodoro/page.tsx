'use client';

import { AppShell } from '@/components/layout';
import { PomodoroView } from '@/components/pomodoro';

export default function PomodoroPage() {
  return (
    <AppShell>
      <PomodoroView />
    </AppShell>
  );
}
