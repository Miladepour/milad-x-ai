import type { Course } from "./types";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Western digits for parsing display dates from EN or FA strings. */
function toWesternDigits(text: string): string {
  return text.replace(/[۰-۹]/g, (ch) => String(PERSIAN_DIGITS.indexOf(ch)));
}

/** Month names used in course display dates (EN + FA labels). */
const MONTH_INDEX: Record<string, number> = {
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
  ژانویه: 0,
  فوریه: 1,
  مارس: 2,
  آوریل: 3,
  مه: 4,
  می: 4,
  ژوئن: 5,
  ژوئیه: 6,
  اوت: 7,
  سپتامبر: 8,
  اکتبر: 9,
  نوامبر: 10,
  دسامبر: 11,
};

function parseDisplayDate(value: string): number | null {
  const normalized = toWesternDigits(value).trim();
  if (!normalized) return null;

  const direct = Date.parse(normalized);
  if (!Number.isNaN(direct)) return direct;

  const match = normalized.match(/(\d{1,2})\s+([A-Za-z\u0600-\u06FF]+)\s+(\d{4})/);
  if (!match) return null;

  const day = Number(match[1]);
  const monthKey = match[2]!.toLowerCase();
  const year = Number(match[3]);
  const month = MONTH_INDEX[monthKey] ?? MONTH_INDEX[match[2]!];
  if (month === undefined || !day || !year) return null;

  return new Date(year, month, day).getTime();
}

/** Earliest session / display date for sorting listings (soonest first). */
export function getCourseSortTimestamp(course: Course): number {
  const candidates = [
    course.date,
    course.meta.sessions[0]?.date,
    course.meta.sessions[1]?.date,
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const ts = parseDisplayDate(raw);
    if (ts != null) return ts;
  }

  return Number.MAX_SAFE_INTEGER;
}

/** Sort courses by workshop date ascending (upcoming soonest first). */
export function sortCoursesByDate(courses: Course[]): Course[] {
  return [...courses].sort(
    (a, b) => getCourseSortTimestamp(a) - getCourseSortTimestamp(b)
  );
}
