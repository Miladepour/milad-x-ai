import StudentProgramCard from "@/components/members/StudentProgramCard";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import {
  resolveProgramDescription,
  resolveProgramTitle,
} from "@/lib/members/program-localized";
import { learnBonusProgramPath } from "@/lib/members/paths";
import type { StudentBonusProgramView } from "@/lib/members/types";

interface StudentBonusProgramCardListProps {
  programs: StudentBonusProgramView[];
  locale: UrlLocale;
  dateLocale: string;
  labels: {
    progress: string;
    lessons: string;
    accessUntil: string;
    noExpiry: string;
    openProgram: string;
  };
}

export default function StudentBonusProgramCardList({
  programs,
  locale,
  dateLocale,
  labels,
}: StudentBonusProgramCardListProps) {
  if (programs.length === 0) return null;

  const internal = urlLocaleToInternal(locale);

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {programs.map((item) => (
        <li key={item.program.id} className="h-full">
          <StudentProgramCard
            href={learnBonusProgramPath(item.program.slug, locale)}
            title={resolveProgramTitle(item.program, internal)}
            description={resolveProgramDescription(item.program, internal)}
            coverImage={item.program.coverImage}
            progressPercent={item.progressPercent}
            completedLessons={item.completedLessons}
            totalLessons={item.totalLessons}
            progressLabel={labels.progress}
            lessonsLabel={labels.lessons}
            accessLabel={labels.accessUntil}
            accessValue={
              item.accessEndsAt
                ? new Date(item.accessEndsAt).toLocaleDateString(dateLocale)
                : labels.noExpiry
            }
            openLabel={labels.openProgram}
            certificateIncluded={false}
          />
        </li>
      ))}
    </ul>
  );
}
