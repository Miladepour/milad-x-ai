import StudentProgramCard from "@/components/members/StudentProgramCard";
import { learnProgramPath } from "@/lib/members/paths";
import type { StudentDashboardProgram } from "@/lib/members/types";
import type { UrlLocale } from "@/lib/i18n/config";

interface StudentProgramCardListProps {
  programs: StudentDashboardProgram[];
  locale: UrlLocale;
  dateLocale: string;
  locked?: boolean;
  labels: {
    progress: string;
    lessons: string;
    accessUntil: string;
    noExpiry: string;
    openProgram: string;
    expiredOn: string;
    programLocked: string;
  };
}

export default function StudentProgramCardList({
  programs,
  locale,
  dateLocale,
  locked = false,
  labels,
}: StudentProgramCardListProps) {
  if (programs.length === 0) return null;

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {programs.map((item) => (
        <li key={item.program.id} className="h-full">
          <StudentProgramCard
            href={locked ? undefined : learnProgramPath(item.program.slug, locale)}
            locked={locked}
            title={item.program.title}
            description={item.program.description}
            coverImage={item.program.coverImage}
            progressPercent={item.progressPercent}
            completedLessons={item.completedLessons}
            totalLessons={item.totalLessons}
            progressLabel={labels.progress}
            lessonsLabel={labels.lessons}
            accessLabel={locked ? labels.expiredOn : labels.accessUntil}
            accessValue={
              item.enrollment.accessEndsAt
                ? new Date(item.enrollment.accessEndsAt).toLocaleDateString(dateLocale)
                : labels.noExpiry
            }
            openLabel={locked ? labels.programLocked : labels.openProgram}
          />
        </li>
      ))}
    </ul>
  );
}
