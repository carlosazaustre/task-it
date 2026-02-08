'use client';

import { useState } from 'react';
import {
  User,
  Palette,
  Timer,
  Bell,
  Tags,
  Database,
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { SettingsProfile } from './SettingsProfile';
import { SettingsAppearance } from './SettingsAppearance';
import { SettingsPomodoro } from './SettingsPomodoro';
import { SettingsNotifications } from './SettingsNotifications';
import { SettingsTags } from './SettingsTags';
import { SettingsData } from './SettingsData';
import { cn } from '@/lib/utils';
import type { SettingsSection } from '@/lib/types';

const NAV_ITEMS: {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'tags', label: 'Etiquetas', icon: Tags },
  { id: 'data', label: 'Datos', icon: Database },
];

export function SettingsView() {
  const {
    profile,
    updateProfile,
    notifications,
    updateNotification,
    pomodoroPrefs,
    updatePomodoroPreference,
    pomodoroConfig,
    updatePomodoroConfig,
    exportData,
    importData,
    clearAllData,
  } = useSettings();

  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  const handleNavClick = (section: SettingsSection) => {
    setActiveSection(section);
    const element = document.getElementById(`settings-${section}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col gap-7">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[34px] font-bold text-foreground font-heading leading-tight">
          Ajustes
        </h1>
        <p className="text-sm text-muted-foreground">
          Personaliza tu experiencia en Task-It
        </p>
      </div>

      {/* Content: Nav + Sections */}
      <div className="flex gap-8">
        {/* Settings Nav - hidden on mobile */}
        <nav className="hidden lg:flex flex-col gap-1 w-[220px] flex-shrink-0 sticky top-10 self-start">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-[14px]',
                  'text-sm transition-colors text-left',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground font-medium'
                )}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sections */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          <div id="settings-profile">
            <SettingsProfile profile={profile} onUpdate={updateProfile} />
          </div>

          <div id="settings-appearance">
            <SettingsAppearance />
          </div>

          <div id="settings-pomodoro">
            <SettingsPomodoro
              config={pomodoroConfig}
              prefs={pomodoroPrefs}
              onConfigChange={updatePomodoroConfig}
              onPreferenceChange={updatePomodoroPreference}
            />
          </div>

          <div id="settings-notifications">
            <SettingsNotifications
              notifications={notifications}
              onUpdate={updateNotification}
            />
          </div>

          <div id="settings-tags">
            <SettingsTags />
          </div>

          <div id="settings-data">
            <SettingsData
              onExport={exportData}
              onImport={importData}
              onClearAll={clearAllData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
