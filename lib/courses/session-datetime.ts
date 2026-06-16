const LONDON_TZ = "Europe/London";

const MONTHS_EN: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const MONTHS_FA: Record<string, number> = {
  ژانویه: 0,
  ژانوي: 0,
  فوریه: 1,
  فوريه: 1,
  مارس: 2,
  آوریل: 3,
  آوريل: 3,
  مه: 4,
  ژوئن: 5,
  ژوئون: 5,
  ژوئیه: 6,
  ژوئيه: 6,
  آگوست: 7,
  اگوست: 7,
  سپتامبر: 8,
  اکتبر: 9,
  نوامبر: 10,
  دسامبر: 11,
};

function normalizeDigits(input: string): string {
  const map: Record<string, string> = {
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };
  return input.replace(/[۰-۹٠-٩]/g, (d) => map[d] ?? d);
}

function monthIndexFromToken(token: string): number | null {
  const cleaned = token
    .trim()
    .replace(/[^a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, "")
    .toLowerCase();

  if (cleaned in MONTHS_EN) return MONTHS_EN[cleaned]!;
  if (cleaned in MONTHS_FA) return MONTHS_FA[cleaned]!;
  return null;
}

/** Convert a wall-clock time in `timeZone` to UTC milliseconds. */
export function zonedLocalToUtcMs(
  year: number,
  monthIndex: number,
  day: number,
  hour: number,
  minute: number,
  timeZone = LONDON_TZ
): number {
  const utcGuess = Date.UTC(year, monthIndex, day, hour, minute, 0);

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date(utcGuess));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  const asUtc = Date.UTC(
    read("year"),
    read("month") - 1,
    read("day"),
    read("hour"),
    read("minute"),
    read("second")
  );

  return utcGuess + (utcGuess - asUtc);
}

export function resolveCourseTimeZone(timezoneLabel: string): string {
  const label = timezoneLabel.toLowerCase();
  if (label.includes("london") || label.includes("لندن")) return LONDON_TZ;
  return LONDON_TZ;
}

export function parseSessionStartMs(
  dateStr: string,
  timeStr: string,
  timezoneLabel: string
): number | null {
  const normalizedDate = normalizeDigits(dateStr).trim();
  const match = normalizedDate.match(/^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const monthToken = match[2];
  const year = Number(match[3]);
  const monthIndex = monthIndexFromToken(monthToken);
  if (monthIndex == null) return null;

  const normalizedTime = normalizeDigits(timeStr).trim();
  const timeMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) return null;

  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  if (!Number.isFinite(day) || !Number.isFinite(year)) return null;
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const timeZone = resolveCourseTimeZone(timezoneLabel);
  return zonedLocalToUtcMs(year, monthIndex, day, hours, minutes, timeZone);
}

const REGISTRATION_CUTOFF_MS = 2 * 24 * 60 * 60 * 1000;

/** Final registration deadline: 2 days before session 1 start (London time). */
export function getRegistrationDeadlineMs(
  dateStr: string,
  timeStr: string,
  timezoneLabel: string
): number | null {
  const startMs = parseSessionStartMs(dateStr, timeStr, timezoneLabel);
  if (startMs == null) return null;
  return startMs - REGISTRATION_CUTOFF_MS;
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export function splitCountdown(remainingMs: number): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: remainingMs,
  };
}
