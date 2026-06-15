import { Award } from "lucide-react";
import StudentPortalButton from "@/components/members/StudentPortalButton";

interface StudentProgramCompletionBannerProps {
  title: string;
  body: string;
  rewatchHint: string;
  certificatesHref: string;
  certificatesCta: string;
  certificateHref?: string | null;
  viewCertificateCta?: string;
}

export default function StudentProgramCompletionBanner({
  title,
  body,
  rewatchHint,
  certificatesHref,
  certificatesCta,
  certificateHref,
  viewCertificateCta,
}: StudentProgramCompletionBannerProps) {
  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-orange/5 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
          <Award className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-dm text-xl font-semibold text-cream">{title}</h2>
          <p className="mt-2 font-dm text-sm leading-relaxed text-cream/75">{body}</p>
          <p className="mt-2 font-dm text-xs leading-relaxed text-cream/50">{rewatchHint}</p>
          <div className="mt-4 flex flex-wrap gap-2">
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
