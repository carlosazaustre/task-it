import type { PomodoroConfig, PomodoroSession } from './types';

/**
 * Generates an array of Pomodoro sessions that fit within the total duration.
 * Alternates between focus and break sessions, using long breaks after every
 * `config.longBreakInterval` focus sessions.
 */
export function generateSessionPlan(config: PomodoroConfig): PomodoroSession[] {
  const sessions: PomodoroSession[] = [];
  let focusCount = 0;
  let timeUsed = 0;

  while (timeUsed + config.focusMinutes <= config.totalDurationMinutes) {
    focusCount++;
    sessions.push({
      index: sessions.length,
      type: 'focus',
      durationMinutes: config.focusMinutes,
      taskId: null,
      label: `Focus #${focusCount}`,
    });
    timeUsed += config.focusMinutes;

    if (focusCount % config.longBreakInterval === 0) {
      if (timeUsed + config.longBreakMinutes <= config.totalDurationMinutes) {
        sessions.push({
          index: sessions.length,
          type: 'long_break',
          durationMinutes: config.longBreakMinutes,
          taskId: null,
          label: 'Descanso Largo',
        });
        timeUsed += config.longBreakMinutes;
      }
    } else {
      if (
        timeUsed + config.shortBreakMinutes <= config.totalDurationMinutes &&
        timeUsed + config.shortBreakMinutes + config.focusMinutes <= config.totalDurationMinutes
      ) {
        sessions.push({
          index: sessions.length,
          type: 'short_break',
          durationMinutes: config.shortBreakMinutes,
          taskId: null,
          label: 'Descanso Corto',
        });
        timeUsed += config.shortBreakMinutes;
      }
    }
  }

  return sessions;
}

/**
 * Calculates a summary of the session plan including counts of each session
 * type and total focus minutes.
 */
export function calculatePlanSummary(sessions: PomodoroSession[]): {
  focusCount: number;
  shortBreakCount: number;
  longBreakCount: number;
  totalFocusMinutes: number;
} {
  let focusCount = 0;
  let shortBreakCount = 0;
  let longBreakCount = 0;
  let totalFocusMinutes = 0;

  for (const session of sessions) {
    switch (session.type) {
      case 'focus':
        focusCount++;
        totalFocusMinutes += session.durationMinutes;
        break;
      case 'short_break':
        shortBreakCount++;
        break;
      case 'long_break':
        longBreakCount++;
        break;
    }
  }

  return { focusCount, shortBreakCount, longBreakCount, totalFocusMinutes };
}

/**
 * Formats a number of minutes into a human-readable string.
 * Examples: 200 -> "3h 20m", 60 -> "1h 0m", 25 -> "25m", 0 -> "0m"
 */
export function formatMinutesAsHoursMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Formats a number of seconds into a MM:SS timer string.
 * Examples: 1500 -> "25:00", 65 -> "01:05", 5 -> "00:05"
 */
export function formatSecondsAsTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Distributes task IDs to focus sessions in a round-robin fashion.
 * Returns a new array without mutating the original sessions.
 * Break sessions always retain taskId as null.
 */
export function distributeTasksToSessions(
  sessions: PomodoroSession[],
  taskIds: string[]
): PomodoroSession[] {
  if (taskIds.length === 0) {
    return sessions.map((session) => ({ ...session }));
  }

  let taskIndex = 0;

  return sessions.map((session) => {
    if (session.type === 'focus') {
      const newSession = { ...session, taskId: taskIds[taskIndex % taskIds.length] };
      taskIndex++;
      return newSession;
    }
    return { ...session };
  });
}
