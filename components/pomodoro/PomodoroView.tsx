'use client';

import { useState, useMemo } from 'react';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useTasks } from '@/hooks/useTasks';
import { useTags } from '@/hooks/useTags';
import { generateSessionPlan, distributeTasksToSessions } from '@/lib/pomodoro-utils';
import { PomodoroHeader } from './PomodoroHeader';
import { PomodoroStats } from './PomodoroStats';
import { PomodoroTaskList } from './PomodoroTaskList';
import { PomodoroSessionPlan } from './PomodoroSessionPlan';
import { ActiveSessionBar } from './ActiveSessionBar';
import { TimerCircle } from './TimerCircle';
import { TimerControls } from './TimerControls';
import { SessionProgress } from './SessionProgress';
import { PomodoroConfigModal } from './PomodoroConfigModal';

export function PomodoroView() {
  const {
    config,
    phase,
    sessions,
    taskIds,
    currentSessionIndex,
    currentSession,
    timeRemainingSeconds,
    isPaused,
    planSummary,
    updateConfig,
    addTaskId,
    removeTaskId,
    startJornada,
    pauseTimer,
    resumeTimer,
    skipSession,
    skipBackSession,
    stopJornada,
  } = usePomodoro();

  const { tasks: allTasks } = useTasks();
  const { tags } = useTags();

  const [showConfigModal, setShowConfigModal] = useState(false);

  // Selected tasks objects
  const selectedTasks = useMemo(
    () => taskIds.map((id) => allTasks.find((t) => t.id === id)).filter(Boolean) as typeof allTasks,
    [taskIds, allTasks]
  );

  // Preview session plan (for setup phase)
  const previewSessions = useMemo(() => {
    const plan = generateSessionPlan(config);
    return distributeTasksToSessions(plan, taskIds);
  }, [config, taskIds]);

  if (phase === 'setup') {
    return (
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <PomodoroHeader
          onConfigClick={() => setShowConfigModal(true)}
          onStartClick={startJornada}
          canStart={true}
        />
        <PomodoroStats
          config={config}
          totalSessions={planSummary.focusCount}
        />
        <div className="flex flex-col lg:flex-row gap-6">
          <PomodoroTaskList
            tasks={selectedTasks}
            allTasks={allTasks}
            tags={tags}
            selectedTaskIds={taskIds}
            onAddTask={addTaskId}
            onRemoveTask={removeTaskId}
          />
          <PomodoroSessionPlan
            sessions={previewSessions}
            tasks={allTasks}
          />
        </div>
        <PomodoroConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          config={config}
          onSave={updateConfig}
        />
      </div>
    );
  }

  if (phase === 'completed') {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold font-heading text-foreground">
          ¡Jornada completada!
        </h2>
        <p className="text-muted-foreground">Has terminado todas las sesiones</p>
        <button
          onClick={stopJornada}
          className="px-5 py-2.5 rounded-[14px] bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Volver al Setup
        </button>
      </div>
    );
  }

  // phase === 'active'
  const activeTaskTitle = currentSession?.taskId
    ? allTasks.find((t) => t.id === currentSession.taskId)?.title ?? null
    : null;

  return (
    <div className="flex-1 p-6 flex flex-col items-center gap-8">
      <div className="w-full max-w-2xl">
        <ActiveSessionBar
          session={currentSession!}
          taskTitle={activeTaskTitle}
          onStop={stopJornada}
        />
      </div>
      <TimerCircle
        timeRemainingSeconds={timeRemainingSeconds}
        totalSeconds={currentSession!.durationMinutes * 60}
        sessionType={currentSession!.type}
        label={currentSession!.label}
      />
      <TimerControls
        isPaused={isPaused}
        onPause={pauseTimer}
        onResume={resumeTimer}
        onSkipBack={skipBackSession}
        onSkipForward={skipSession}
        canSkipBack={currentSessionIndex > 0}
        canSkipForward={currentSessionIndex < sessions.length - 1}
      />
      <SessionProgress
        sessions={sessions}
        currentIndex={currentSessionIndex}
      />
    </div>
  );
}
