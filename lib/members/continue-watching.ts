import { buildLessonUnlockMap } from "./lesson-gating";
import type { LessonProgress, ProgramLesson, StudentDashboardProgram } from "./types";

function timestamp(value: string | null | undefined): number {
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

export function resolveContinueLesson(
  lessons: ProgramLesson[],
  progressMap: Map<string, LessonProgress>,
  enrollmentLastAccessedAt: string | null
): { lesson: ProgramLesson | null; watchedAt: number } {
  const completedIds = new Set<string>();
  progressMap.forEach((progress, lessonId) => {
    if (progress.completedAt) completedIds.add(lessonId);
  });
  const unlockMap = buildLessonUnlockMap(lessons, completedIds);

  let lesson: ProgramLesson | null = null;
  let watchedAt = 0;

  for (const item of lessons) {
    const progress = progressMap.get(item.id);
    if (!progress || progress.completedAt) continue;
    if (!unlockMap.get(item.id)?.unlocked) continue;

    const activityAt = timestamp(progress.updatedAt);
    if (activityAt > watchedAt) {
      watchedAt = activityAt;
      lesson = item;
    }
  }

  if (!lesson) {
    for (const item of lessons) {
      if (progressMap.get(item.id)?.completedAt) continue;
      if (!unlockMap.get(item.id)?.unlocked) continue;
      lesson = item;
      break;
    }
  }

  const enrollmentAt = timestamp(enrollmentLastAccessedAt);
  return {
    lesson,
    watchedAt: Math.max(watchedAt, enrollmentAt),
  };
}

export function pickContinueWatchingProgram(
  programs: StudentDashboardProgram[]
): StudentDashboardProgram | null {
  let best: StudentDashboardProgram | null = null;
  let bestAt = -1;

  for (const program of programs) {
    if (!program.continueLesson) continue;
    const at = program.continueWatchingAt;
    if (at > bestAt) {
      bestAt = at;
      best = program;
    }
  }

  return best;
}
