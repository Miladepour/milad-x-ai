import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { learnProgramPath } from "@/lib/members/paths";
import type { UrlLocale } from "@/lib/i18n/config";

interface ProgramContentLockedProps {
  locale: UrlLocale;
  programSlug: string;
  labels: {
    title: string;
    body: string;
    backToProgram: string;
  };
}

export default function ProgramContentLocked({
  locale,
  programSlug,
  labels,
}: ProgramContentLockedProps) {
  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard className="text-center">
        <h1 className="font-dm text-2xl font-semibold text-cream sm:text-3xl">
          {labels.title}
        </h1>
        <p className="mt-3 font-dm text-sm leading-relaxed text-cream/60">{labels.body}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <StudentPortalButton href={learnProgramPath(programSlug, locale)} variant="primary">
            {labels.backToProgram}
          </StudentPortalButton>
        </div>
      </StudentGlassCard>
    </div>
  );
}
