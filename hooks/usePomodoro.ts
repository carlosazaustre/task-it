'use client';

import { useCallback, useMemo, useRef, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { PomodoroConfig, PomodoroSession, PomodoroState } from '@/lib/types';
import { STORAGE_KEYS, POMODORO_DEFAULTS } from '@/lib/constants';
import { generateSessionPlan, calculatePlanSummary, distributeTasksToSessions } from '@/lib/pomodoro-utils';

const DEFAULT_STATE: PomodoroState = {
  phase: 'setup',
  config: POMODORO_DEFAULTS,
  sessions: [],
  taskIds: [],
  currentSessionIndex: 0,
  timeRemainingSeconds: 0,
  isPaused: false,
  startedAt: null,
};

/**
 * Hook for Pomodoro timer management with localStorage persistence.
 * Handles configuration, session planning, timer countdown, and task distribution.
 */
export function usePomodoro() {
  const [config, setConfig] = useLocalStorage<PomodoroConfig>(
    STORAGE_KEYS.POMODORO_CONFIG,
    POMODORO_DEFAULTS
  );

  const [state, setState] = useLocalStorage<PomodoroState>(
    STORAGE_KEYS.POMODORO_STATE,
    DEFAULT_STATE
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Derived state ---

  const currentSession: PomodoroSession | null =
    state.sessions[state.currentSessionIndex] ?? null;

  const planSummary = useMemo(() => {
    const previewSessions = generateSessionPlan(config);
    return calculatePlanSummary(previewSessions);
  }, [config]);

  // --- Config actions ---

  const updateConfig = useCallback(
    (newConfig: PomodoroConfig) => {
      setConfig(newConfig);
    },
    [setConfig]
  );

  // --- Setup phase actions ---

  const setTaskIds = useCallback(
    (ids: string[]) => {
      setState((prev) => ({ ...prev, taskIds: ids }));
    },
    [setState]
  );

  const addTaskId = useCallback(
    (id: string) => {
      setState((prev) => {
        if (prev.taskIds.includes(id)) {
          return prev;
        }
        return { ...prev, taskIds: [...prev.taskIds, id] };
      });
    },
    [setState]
  );

  const removeTaskId = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        taskIds: prev.taskIds.filter((taskId) => taskId !== id),
      }));
    },
    [setState]
  );

  // --- Session actions ---

  const startJornada = useCallback(() => {
    const sessions = generateSessionPlan(config);
    const distributed = distributeTasksToSessions(sessions, state.taskIds);

    setState((prev) => ({
      ...prev,
      phase: 'active' as const,
      config,
      sessions: distributed,
      currentSessionIndex: 0,
      timeRemainingSeconds: distributed.length > 0 ? distributed[0].durationMinutes * 60 : 0,
      isPaused: false,
      startedAt: new Date().toISOString(),
    }));
  }, [config, state.taskIds, setState]);

  const pauseTimer = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
  }, [setState]);

  const resumeTimer = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
  }, [setState]);

  const skipSession = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentSessionIndex + 1;
      if (nextIndex >= prev.sessions.length) {
        return { ...prev, timeRemainingSeconds: 0, phase: 'completed' as const };
      }
      return {
        ...prev,
        currentSessionIndex: nextIndex,
        timeRemainingSeconds: prev.sessions[nextIndex].durationMinutes * 60,
      };
    });
  }, [setState]);

  const skipBackSession = useCallback(() => {
    setState((prev) => {
      if (prev.currentSessionIndex <= 0) {
        return prev;
      }
      const prevIndex = prev.currentSessionIndex - 1;
      return {
        ...prev,
        currentSessionIndex: prevIndex,
        timeRemainingSeconds: prev.sessions[prevIndex].durationMinutes * 60,
      };
    });
  }, [setState]);

  const stopJornada = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'setup' as const,
      sessions: [],
      currentSessionIndex: 0,
      timeRemainingSeconds: 0,
      isPaused: false,
      startedAt: null,
    }));
  }, [setState]);

  // --- Timer logic ---

  useEffect(() => {
    if (state.phase === 'active' && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeRemainingSeconds <= 1) {
            // Auto-advance to next session
            const nextIndex = prev.currentSessionIndex + 1;
            if (nextIndex >= prev.sessions.length) {
              return { ...prev, timeRemainingSeconds: 0, phase: 'completed' as const };
            }
            return {
              ...prev,
              currentSessionIndex: nextIndex,
              timeRemainingSeconds: prev.sessions[nextIndex].durationMinutes * 60,
            };
          }
          return { ...prev, timeRemainingSeconds: prev.timeRemainingSeconds - 1 };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.phase, state.isPaused, setState]);

  // --- Return memoized API ---

  return useMemo(
    () => ({
      // State
      config,
      phase: state.phase,
      sessions: state.sessions,
      taskIds: state.taskIds,
      currentSessionIndex: state.currentSessionIndex,
      currentSession,
      timeRemainingSeconds: state.timeRemainingSeconds,
      isPaused: state.isPaused,

      // Derived
      planSummary,

      // Config actions
      updateConfig,

      // Setup actions
      setTaskIds,
      addTaskId,
      removeTaskId,

      // Session actions
      startJornada,
      pauseTimer,
      resumeTimer,
      skipSession,
      skipBackSession,
      stopJornada,
    }),
    [
      config,
      state.phase,
      state.sessions,
      state.taskIds,
      state.currentSessionIndex,
      currentSession,
      state.timeRemainingSeconds,
      state.isPaused,
      planSummary,
      updateConfig,
      setTaskIds,
      addTaskId,
      removeTaskId,
      startJornada,
      pauseTimer,
      resumeTimer,
      skipSession,
      skipBackSession,
      stopJornada,
    ]
  );
}
