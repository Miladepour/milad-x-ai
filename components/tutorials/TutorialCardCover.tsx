interface TutorialCardCoverProps {
  title: string;
  freeLabel: string;
}

/** Unified tutorial card cover — brand gradient + title (hub listing). */
export default function TutorialCardCover({
  title,
  freeLabel,
}: TutorialCardCoverProps) {
  return (
    <div className="relative w-full min-h-[168px] aspect-[4/3] sm:aspect-video sm:min-h-0 overflow-hidden bg-gradient-to-br from-[#2a1810] via-[#1a1a1a] to-background">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 100% 0%, rgba(255,92,0,0.45) 0%, transparent 65%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 0% 100%, rgba(255,184,0,0.35) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#FFB800] via-orange to-[#E84D00]" />

      <div className="relative flex h-full min-h-[168px] sm:min-h-0 flex-col gap-3 p-4 sm:p-4 md:p-5">
        <div className="flex shrink-0 items-start justify-between gap-2">
          <span className="font-mono text-[11px] sm:text-xs text-orange uppercase tracking-widest rtl:tracking-normal border border-orange/40 rounded-full px-2.5 py-1 bg-background/50">
            {freeLabel}
          </span>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cream/20 bg-background/50 text-cream/90"
            aria-hidden
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ms-0.5 h-3.5 w-3.5"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        <p className="min-h-0 flex-1 font-dm font-bold text-cream text-xl sm:text-sm md:text-[15px] leading-normal sm:leading-snug line-clamp-4 sm:line-clamp-3 md:line-clamp-4 text-start">
          {title}
        </p>
      </div>
    </div>
  );
}
