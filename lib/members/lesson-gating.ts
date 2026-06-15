import type { ProgramLesson } from "./types";

export interface LessonUnlockState {
  unlocked: boolean;
  previousLesson: ProgramLesson | null;
}

export function buildLessonUnlockMap(
  lessons: ProgramLesson[],
  completedLessonIds: Set<string>
): Map<string, LessonUnlockState> {
  const sorted = [...lessons].sort((a, b) => a.sortOrder - b.sortOrder);
  const map = new Map<string, LessonUnlockState>();

  for (let index = 0; index < sorted.length; index += 1) {
    const lesson = sorted[index];
    const previousLesson = index > 0 ? sorted[index - 1] : null;

    if (completedLessonIds.has(lesson.id)) {
      map.set(lesson.id, { unlocked: true, previousLesson });
      continue;
    }

    if (index === 0) {
      map.set(lesson.id, { unlocked: true, previousLesson: null });
      continue;
    }

    const unlocked = previousLesson
      ? completedLessonIds.has(previousLesson.id)
      : true;
    map.set(lesson.id, { unlocked, previousLesson });
  }

  return map;
}

export function isLessonUnlocked(
  lessons: ProgramLesson[],
  lessonId: string,
  completedLessonIds: Set<string>
): LessonUnlockState {
  const map = buildLessonUnlockMap(lessons, completedLessonIds);
  return map.get(lessonId) ?? { unlocked: false, previousLesson: null };
}
