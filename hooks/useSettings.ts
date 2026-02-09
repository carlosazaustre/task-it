'use client';

import { useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { api } from '@/lib/api-client';
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
import type { ImportPayload } from '@/lib/api-client';

interface LegacyTask {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  tags?: string[];
}

interface LegacyTag {
  id: string;
  name: string;
  color: string;
}

const STATUS_MAP: Record<string, string> = {
  pending: 'PENDING',
  in_progress: 'IN_PROGRESS',
  completed: 'COMPLETED',
};

const PRIORITY_MAP: Record<string, string> = {
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
};

/**
 * Transform a legacy localStorage export (double-serialized JSON strings)
 * into the API import format.
 */
function transformLegacyExport(data: Record<string, unknown>): ImportPayload {
  const legacyTags: LegacyTag[] = typeof data.tags === 'string'
    ? JSON.parse(data.tags)
    : [];
  const legacyTasks: LegacyTask[] = typeof data.tasks === 'string'
    ? JSON.parse(data.tasks)
    : [];

  // Build tag lookup: id -> {name, color}
  const tagById = new Map(legacyTags.map((t) => [t.id, { name: t.name, color: t.color }]));

  return {
    tags: legacyTags.map((t) => ({ name: t.name, color: t.color })),
    tasks: legacyTasks.map((t) => ({
      title: t.title,
      description: t.description || '',
      status: (STATUS_MAP[t.status || 'pending'] || 'PENDING') as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
      priority: (PRIORITY_MAP[t.priority || 'medium'] || 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW',
      dueDate: t.dueDate || null,
      tags: (t.tags || [])
        .map((id) => tagById.get(id))
        .filter((tag): tag is { name: string; color: string } => tag !== undefined),
    })),
  };
}

export function useSettings() {
  const hasSynced = useRef(false);

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

      // Try to sync with API (fire-and-forget)
      api.updateProfile(data).catch(() => {
        // Silently fail - localStorage is the source of truth as fallback
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

      // Try to sync with API
      api.updateSettings({ notifications: { [key]: value } }).catch(() => {});
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

      // Map to API field names
      const apiKey = key === 'autoStartNext' ? 'autoStartNext' : 'soundEnabled';
      api.updateSettings({ pomodoro: { [apiKey]: value } }).catch(() => {});
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

      // Map to API field names
      const keyMap: Record<string, string> = {
        focusMinutes: 'focusMinutes',
        shortBreakMinutes: 'shortBreakMinutes',
        longBreakMinutes: 'longBreakMinutes',
        longBreakInterval: 'longBreakInterval',
        totalDurationMinutes: 'totalDurationMinutes',
      };
      if (keyMap[key]) {
        api.updateSettings({ pomodoro: { [keyMap[key]]: value } }).catch(() => {});
      }
    },
    [setPomodoroConfig]
  );

  // --- Sync from API on mount (hydrate localStorage from server) ---
  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;

    // Sync profile from API
    api.getProfile().then((data) => {
      if (data && data.name) {
        setProfile({
          name: data.name || '',
          email: data.email || '',
          role: data.role || '',
          language: (data.language as 'es' | 'en') || 'es',
          initials: data.initials || 'U',
        });
      }
    }).catch(() => {});

    // Sync settings from API
    api.getSettings().then((data) => {
      if (data) {
        if (data.notifications) {
          setNotifications({
            taskReminders: data.notifications.taskReminders ?? DEFAULT_NOTIFICATION_SETTINGS.taskReminders,
            dailySummary: data.notifications.dailySummary ?? DEFAULT_NOTIFICATION_SETTINGS.dailySummary,
            streakAlert: data.notifications.streakAlert ?? DEFAULT_NOTIFICATION_SETTINGS.streakAlert,
          });
        }
        if (data.pomodoro) {
          setPomodoroPrefs({
            autoStartNext: data.pomodoro.autoStartNext ?? DEFAULT_POMODORO_PREFERENCES.autoStartNext,
            soundEnabled: data.pomodoro.soundEnabled ?? DEFAULT_POMODORO_PREFERENCES.soundEnabled,
          });
          setPomodoroConfig({
            focusMinutes: data.pomodoro.focusMinutes ?? POMODORO_DEFAULTS.focusMinutes,
            shortBreakMinutes: data.pomodoro.shortBreakMinutes ?? POMODORO_DEFAULTS.shortBreakMinutes,
            longBreakMinutes: data.pomodoro.longBreakMinutes ?? POMODORO_DEFAULTS.longBreakMinutes,
            longBreakInterval: data.pomodoro.longBreakInterval ?? POMODORO_DEFAULTS.longBreakInterval,
            totalDurationMinutes: data.pomodoro.totalDurationMinutes ?? POMODORO_DEFAULTS.totalDurationMinutes,
          });
        }
      }
    }).catch(() => {});
  }, [setProfile, setNotifications, setPomodoroPrefs, setPomodoroConfig]);

  // --- Data management (via API) ---
  const exportData = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const data = await api.exportAllData();

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `task-it-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail - user can retry
    }
  }, []);

  const importData = useCallback(
    (file: File): Promise<boolean> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined') {
          resolve(false);
          return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);

            if (!data || typeof data !== 'object') {
              resolve(false);
              return;
            }

            // Detect legacy localStorage export format (values are JSON strings, not arrays)
            const payload = typeof data.tasks === 'string' || typeof data.tags === 'string'
              ? transformLegacyExport(data)
              : data;

            await api.importAllData(payload);
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

  const clearAllData = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      await api.clearAllData();

      // Also clear localStorage cache
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });

      window.location.reload();
    } catch {
      // Silently fail - user can retry
    }
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
