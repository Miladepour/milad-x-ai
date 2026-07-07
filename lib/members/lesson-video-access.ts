import { getStudentBonusLesson } from "@/lib/members/bonus-store";
import { isBunnyUrl } from "@/lib/members/bunny";
import { isLessonUnlocked } from "@/lib/members/lesson-gating";
import { getCompletedLessonIds, getStudentLesson } from "@/lib/members/store";

export type LessonProgramKind = "main" | "bonus";

export async function getAuthorizedLessonBunnyVideoUrl(
  userId: string,
  programSlug: string,
  lessonId: string,
  programKind: LessonProgramKind
): Promise<string | null> {
  const slug = programSlug.trim();
  const id = lessonId.trim();
  if (!slug || !id) return null;

  if (programKind === "bonus") {
    const data = await getStudentBonusLesson(userId, slug, id);
    if (!data || data.lesson.lessonType !== "video") return null;
    const videoUrl = data.lesson.videoUrl?.trim();
    if (!videoUrl || !isBunnyUrl(videoUrl)) return null;
    return videoUrl;
  }

  const data = await getStudentLesson(userId, slug, id);
  if (!data || data.lesson.lessonType !== "video") return null;

  if (data.program.comingSoon) return null;

  const completedIds = await getCompletedLessonIds(
    userId,
    data.lessons.map((lesson) => lesson.id)
  );
  const unlock = isLessonUnlocked(data.lessons, id, completedIds);
  if (!unlock.unlocked) return null;

  const videoUrl = data.lesson.videoUrl?.trim();
  if (!videoUrl || !isBunnyUrl(videoUrl)) return null;
  return videoUrl;
}
