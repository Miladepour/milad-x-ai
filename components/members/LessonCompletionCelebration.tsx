import { Award } from "lucide-react";
import StudentPortalButton from "@/components/members/StudentPortalButton";

interface LessonCompletionCelebrationProps {
  title: string;
  body: string;
  rewatchHint: string;
  certificatesHref: string;
  certificatesCta: string;
  certificateHref?: string | null;
  viewCertificateCta?: string;
}

export default function LessonCompletionCelebration({
  title,
  body,
  rewatchHint,
  certificatesHref,
  certificatesCta,
  certificateHref,
  viewCertificateCta,
}: LessonCompletionCelebrationProps) {
  return (
    <div
      className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5"
      role="status"
    >
      <div className="flex items-start gap-3">
        <Award className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" strokeWidth={1.75} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-dm text-base font-semibold text-cream">{title}</p>
          <p className="mt-1 font-dm text-sm leading-relaxed text-cream/75">{body}</p>
          <p className="mt-2 font-dm text-xs text-cream/50">{rewatchHint}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StudentPortalButton href={certificatesHref} variant="primary">
              {certificatesCta}
            </StudentPortalButton>
            {certificateHref && viewCertificateCta ? (
              <StudentPortalButton href={certificateHref} variant="secondary">
                {viewCertificateCta}
              </StudentPortalButton>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
