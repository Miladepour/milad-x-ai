"use client";

interface LessonVideoPosterProps {
  title: string;
  playLabel: string;
  onPlay: () => void;
}

export default function LessonVideoPoster({
  title,
  playLabel,
  onPlay,
}: LessonVideoPosterProps) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className="group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden bg-background text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
      aria-label={playLabel}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange/20 via-background to-background"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,120,40,0.25), transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,120,40,0.12), transparent 40%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-orange to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex max-w-[85%] flex-col items-center gap-6 px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-orange/80 sm:text-xs">
          MX AI Academy
        </p>
        <h2 className="font-dm text-2xl font-semibold leading-tight text-cream sm:text-3xl md:text-4xl">
          {title}
        </h2>
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-orange/60 bg-orange/10 text-orange transition-transform group-hover:scale-105 group-hover:bg-orange group-hover:text-background sm:h-20 sm:w-20">
          <svg
            viewBox="0 0 24 24"
            className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8"
            aria-hidden
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
    </button>
  );
}
