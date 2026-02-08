'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type {
  UserProfile,
  NotificationSettings,
  PomodoroPreferences,
  PomodoroConfig,
} from '@/lib/types';
import {
  STORAGE_KEYS,
  DEFAULT_USER_PROFILE,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_POMODORO_PREFERENCES,
  POMODORO_DEFAULTS,
} from '@/lib/constants';

export function useSettings() {
  // --- Profile ---
  const [profile, setProfile] = useLocalStorage<UserProfile>(
    STORAGE_KEYS.USER_PROFILE,
    DEFAULT_USER_PROFILE
  );

  const updateProfile = useCallback(
    (data: Partial<UserProfile>) => {
      setProfile((prev) => {
        const updated = { ...prev, ...data };
        if (data.name !== undefined) {
          updated.initials =
            data.name
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'U';
        }
        return updated;
      });
    },
    [setProfile]
  );

  // --- Notifications ---
  const [notifications, setNotifications] =
    useLocalStorage<NotificationSettings>(
      STORAGE_KEYS.NOTIFICATION_SETTINGS,
      DEFAULT_NOTIFICATION_SETTINGS
    );

  const updateNotification = useCallback(
    (key: keyof NotificationSettings, value: boolean) => {
      setNotifications((prev) => ({ ...prev, [key]: value }));
    },
    [setNotifications]
  );

  // --- Pomodoro Preferences (autostart, sound) ---
  const [pomodoroPrefs, setPomodoroPrefs] =
    useLocalStorage<PomodoroPreferences>(
      STORAGE_KEYS.POMODORO_PREFERENCES,
      DEFAULT_POMODORO_PREFERENCES
    );

  const updatePomodoroPreference = useCallback(
    (key: keyof PomodoroPreferences, value: boolean) => {
      setPomodoroPrefs((prev) => ({ ...prev, [key]: value }));
    },
    [setPomodoroPrefs]
  );

  // --- Pomodoro Config (reutiliza STORAGE_KEYS.POMODORO_CONFIG existente) ---
  const [pomodoroConfig, setPomodoroConfig] =
    useLocalStorage<PomodoroConfig>(
      STORAGE_KEYS.POMODORO_CONFIG,
      POMODORO_DEFAULTS
    );

  const updatePomodoroConfig = useCallback(
    (key: keyof PomodoroConfig, value: number) => {
      setPomodoroConfig((prev) => ({ ...prev, [key]: value }));
    },
    [setPomodoroConfig]
  );

  // --- Data management ---
  const exportData = useCallback(() => {
    if (typeof window === 'undefined') return;

    const data = {
      tasks: localStorage.getItem(STORAGE_KEYS.TASKS),
      tags: localStorage.getItem(STORAGE_KEYS.TAGS),
      pomodoroConfig: localStorage.getItem(STORAGE_KEYS.POMODORO_CONFIG),
      pomodoroPreferences: localStorage.getItem(STORAGE_KEYS.POMODORO_PREFERENCES),
      userProfile: localStorage.getItem(STORAGE_KEYS.USER_PROFILE),
      notificationSettings: localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-it-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback(
    (file: File): Promise<boolean> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined') {
          resolve(false);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);

            // Only import if the parsed data has expected keys
            if (!data || typeof data !== 'object') {
              resolve(false);
              return;
            }

            if (data.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, data.tasks);
            if (data.tags) localStorage.setItem(STORAGE_KEYS.TAGS, data.tags);
            if (data.pomodoroConfig)
              localStorage.setItem(STORAGE_KEYS.POMODORO_CONFIG, data.pomodoroConfig);
            if (data.pomodoroPreferences)
              localStorage.setItem(
                STORAGE_KEYS.POMODORO_PREFERENCES,
                data.pomodoroPreferences
              );
            if (data.userProfile)
              localStorage.setItem(STORAGE_KEYS.USER_PROFILE, data.userProfile);
            if (data.notificationSettings)
              localStorage.setItem(
                STORAGE_KEYS.NOTIFICATION_SETTINGS,
                data.notificationSettings
              );

            window.location.reload();
            resolve(true);
          } catch {
            resolve(false);
          }
        };
        reader.onerror = () => {
          resolve(false);
        };
        reader.readAsText(file);
      });
    },
    []
  );

  const clearAllData = useCallback(() => {
    if (typeof window === 'undefined') return;

    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    window.location.reload();
  }, []);

  return useMemo(
    () => ({
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
    }),
    [
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
    ]
  );
}
