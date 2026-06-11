import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import { learnPath } from "@/lib/members/paths";
import type { UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";

interface StudentAccessEndedProps {
  locale: UrlLocale;
  programTitle?: string;
  labels: {
    title: string;
    body: string;
    contactSupport: string;
    backToDashboard: string;
  };
}

export default function StudentAccessEnded({
  locale,
  programTitle,
  labels,
}: StudentAccessEndedProps) {
  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-orange/30 bg-orange/10">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-orange"
            aria-hidden
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <h1 className="mt-5 font-dm text-2xl font-semibold text-cream sm:text-3xl">
          {labels.title}
        </h1>
        {programTitle && (
          <p className="mt-2 font-dm text-lg text-orange">{programTitle}</p>
        )}
        <p className="mx-auto mt-4 max-w-xl font-dm text-sm leading-relaxed text-cream/65 sm:text-base">
          {labels.body}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <StudentPortalButton href={localizedPath("/contact", locale)} variant="primary">
            {labels.contactSupport}
          </StudentPortalButton>
          <StudentPortalButton href={learnPath(locale)} variant="secondary">
            {labels.backToDashboard}
          </StudentPortalButton>
        </div>
      </StudentGlassCard>
    </div>
  );
}
