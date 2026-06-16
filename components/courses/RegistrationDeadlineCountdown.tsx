"use client";

import { useEffect, useMemo, useState } from "react";
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
}: {
  value: number;
  max: number;
  display: string;
  label: string;
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
            stroke="url(#registrationCountdownGradient)"
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
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remainingMs = deadlineMs - nowMs;
  const closed = remainingMs <= 0;

  const parts = useMemo(
    () => (closed ? null : splitCountdown(remainingMs)),
    [closed, remainingMs]
  );

  const daysMax = useMemo(() => {
    if (!parts) return 30;
    return Math.max(parts.days + 1, 30);
  }, [parts]);

  return (
    <div className="rounded-sm border border-surface/80 bg-[#141414] px-3 py-4">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient
            id="registrationCountdownGradient"
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

      <p className="font-mono text-[11px] text-orange uppercase tracking-widest rtl:tracking-normal text-center mb-4">
        {labels.title}
      </p>

      {closed ? (
        <p className="font-dm text-cream/90 text-sm text-center">{labels.closed}</p>
      ) : (
        parts && (
          <div className="flex items-start justify-between gap-1">
            <CountdownRing
              value={parts.days}
              max={daysMax}
              display={padCount(parts.days, lang)}
              label={labels.days}
            />
            <CountdownRing
              value={parts.hours}
              max={24}
              display={padCount(parts.hours, lang)}
              label={labels.hours}
            />
            <CountdownRing
              value={parts.minutes}
              max={60}
              display={padCount(parts.minutes, lang)}
              label={labels.minutes}
            />
            <CountdownRing
              value={parts.seconds}
              max={60}
              display={padCount(parts.seconds, lang)}
              label={labels.seconds}
            />
          </div>
        )
      )}
    </div>
  );
}
