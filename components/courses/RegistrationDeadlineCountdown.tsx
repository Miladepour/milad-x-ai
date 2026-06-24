"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { splitCountdown } from "@/lib/courses/session-datetime";
import { toLocaleDigits } from "@/lib/i18n/digits";
import type { Locale } from "@/lib/i18n/translations";

interface RegistrationDeadlineCountdownProps {
  deadlineMs: number;
  lang: Locale;
  labels: {
    title: string;
    closed: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
}

function padCount(value: number, lang: Locale) {
  return toLocaleDigits(String(value).padStart(2, "0"), lang);
}

function CountdownRing({
  value,
  max,
  display,
  label,
  gradientId,
}: {
  value: number;
  max: number;
  display: string;
  label: string;
  gradientId: string;
}) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
      <div className="relative w-[72px] h-[72px] shrink-0">
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 72 72"
          aria-hidden
        >
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="4"
          />
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-lg font-semibold text-cream tabular-nums">
          {display}
        </span>
      </div>
      <span className="font-mono text-[10px] text-cream/65 uppercase tracking-widest rtl:tracking-normal text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

export default function RegistrationDeadlineCountdown({
  deadlineMs,
  lang,
  labels,
}: RegistrationDeadlineCountdownProps) {
  const gradientId = useId();
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remainingMs = nowMs == null ? deadlineMs : deadlineMs - nowMs;
  const closed = nowMs != null && remainingMs <= 0;

  const parts = useMemo(
    () => (closed || nowMs == null ? null : splitCountdown(remainingMs)),
    [closed, nowMs, remainingMs]
  );

  const daysMax = useMemo(() => {
    if (!parts) return 30;
    return Math.max(parts.days + 1, 30);
  }, [parts]);

  if (nowMs == null) {
    return (
      <div className="rounded-sm border border-surface/80 bg-[#141414] px-3 py-4">
        <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-widest text-orange rtl:tracking-normal">
          {labels.title}
        </p>
        <div className="flex items-start justify-between gap-1" aria-hidden>
          {[labels.days, labels.hours, labels.minutes, labels.seconds].map((label) => (
            <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="h-[72px] w-[72px] shrink-0 rounded-full border border-white/10" />
              <span className="text-center font-mono text-[10px] uppercase leading-tight tracking-widest text-cream/65 rtl:tracking-normal">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-surface/80 bg-[#141414] px-3 py-4">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="55%" stopColor="#FF8A00" />
            <stop offset="100%" stopColor="#FF5C00" />
          </linearGradient>
        </defs>
      </svg>

      <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-widest text-orange rtl:tracking-normal">
        {labels.title}
      </p>

      {closed ? (
        <p className="text-center font-dm text-sm text-cream/90">{labels.closed}</p>
      ) : (
        parts && (
          <div className="flex items-start justify-between gap-1">
            <CountdownRing
              value={parts.days}
              max={daysMax}
              display={padCount(parts.days, lang)}
              label={labels.days}
              gradientId={gradientId}
            />
            <CountdownRing
              value={parts.hours}
              max={24}
              display={padCount(parts.hours, lang)}
              label={labels.hours}
              gradientId={gradientId}
            />
            <CountdownRing
              value={parts.minutes}
              max={60}
              display={padCount(parts.minutes, lang)}
              label={labels.minutes}
              gradientId={gradientId}
            />
            <CountdownRing
              value={parts.seconds}
              max={60}
              display={padCount(parts.seconds, lang)}
              label={labels.seconds}
              gradientId={gradientId}
            />
          </div>
        )
      )}
    </div>
  );
}
