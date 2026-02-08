'use client';

import { AppShell } from '@/components/layout/AppShell';
import { SettingsView } from '@/components/settings';

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsView />
    </AppShell>
  );
}
