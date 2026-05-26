import type { CourseAdminPayload, CourseLocaleContent, CourseLocaleInput } from "./cms-types";
import type { CourseStatus } from "./types";

const STATUSES: CourseStatus[] = ["Live", "Coming Soon", "Closed"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

function parseLocaleContent(value: unknown, label: string): CourseLocaleContent {
  if (!isRecord(value)) throw new Error(`${label}: content must be an object`);
  const meta = value.meta;
  if (!isRecord(meta)) throw new Error(`${label}: meta is required`);

  const sessions = Array.isArray(meta.sessions) ? meta.sessions : [];
  const parsedMeta = {
    instructor: requireString(meta.instructor, `${label} meta.instructor`),
    format: requireString(meta.format, `${label} meta.format`),
    totalHours: requireString(meta.totalHours, `${label} meta.totalHours`),
    partsCount: Number(meta.partsCount) || 0,
    timezone: requireString(meta.timezone, `${label} meta.timezone`),
    sessions: sessions.map((s, i) => {
      if (!isRecord(s)) throw new Error(`${label} session ${i} invalid`);
      return {
        id: requireString(s.id, `${label} session.id`),
        date: requireString(s.date, `${label} session.date`),
        time: requireString(s.time, `${label} session.time`),
        durationHours: Number(s.durationHours) || 0,
      };
    }),
  };

  const includes = Array.isArray(value.includes) ? value.includes : [];
  const insights = value.insights;
  if (!isRecord(insights)) throw new Error(`${label}: insights is required`);

  const faq = Array.isArray(value.faq) ? value.faq : [];
  const sections = Array.isArray(value.sections) ? value.sections : [];

  return {
    meta: parsedMeta,
    includes: includes.map((item, i) => {
      if (!isRecord(item)) throw new Error(`${label} include ${i} invalid`);
      return { text: requireString(item.text, `${label} include.text`) };
    }),
    insights: {
      audience: Array.isArray(insights.audience)
        ? insights.audience.map((a) => String(a).trim()).filter(Boolean)
        : [],
      topicsCount: Number(insights.topicsCount) || 0,
      requirements: Array.isArray(insights.requirements)
        ? insights.requirements.map((r) => String(r).trim()).filter(Boolean)
        : [],
    },
    faq: faq.map((item, i) => {
      if (!isRecord(item)) throw new Error(`${label} faq ${i} invalid`);
      return {
        id: requireString(item.id, `${label} faq.id`),
        question: requireString(item.question, `${label} faq.question`),
        answer: requireString(item.answer, `${label} faq.answer`),
      };
    }),
    sections: sections as CourseLocaleContent["sections"],
  };
}

function parseLocaleInput(value: unknown, label: string): CourseLocaleInput {
  if (!isRecord(value)) throw new Error(`${label} locale must be an object`);
  const status = requireString(value.status, `${label} status`) as CourseStatus;
  if (!STATUSES.includes(status)) {
    throw new Error(`${label}: invalid status`);
  }

  const contentSource =
    value.content && isRecord(value.content) ? value.content : value;

  return {
    listTitle: requireString(value.listTitle, `${label} listTitle`),
    title: requireString(value.title, `${label} title`),
    subtitle: requireString(value.subtitle, `${label} subtitle`),
    excerpt: requireString(value.excerpt, `${label} excerpt`),
    date: requireString(value.date, `${label} date`),
    status,
    content: parseLocaleContent(contentSource, label),
  };
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function parseCourseAdminPayload(value: unknown): CourseAdminPayload {
  if (!isRecord(value)) throw new Error("Invalid course payload");
  const slug = normalizeSlug(requireString(value.slug, "slug"));
  if (!slug) throw new Error("slug is required");

  const locales = value.locales;
  if (!isRecord(locales)) throw new Error("locales.EN and locales.FA are required");

  const publishedAt =
    value.publishedAt === null || value.publishedAt === undefined || value.publishedAt === ""
      ? null
      : new Date(String(value.publishedAt)).toISOString();

  return {
    slug,
    coverImage: requireString(value.coverImage, "coverImage"),
    priceUsd: Number(value.priceUsd) || 0,
    sortOrder: Number(value.sortOrder) || 0,
    publishedAt,
    locales: {
      EN: parseLocaleInput(locales.EN, "EN"),
      FA: parseLocaleInput(locales.FA, "FA"),
    },
  };
}

export function courseToAdminPayload(course: {
  slug: string;
  coverImage: string;
  priceUsd: number;
  listTitle: string;
  title: string;
  subtitle: string;
  excerpt: string;
  date: string;
  status: CourseStatus;
  meta: CourseLocaleContent["meta"];
  includes: CourseLocaleContent["includes"];
  insights: CourseLocaleContent["insights"];
  faq: CourseLocaleContent["faq"];
  sections: CourseLocaleContent["sections"];
}): CourseLocaleInput {
  return {
    listTitle: course.listTitle,
    title: course.title,
    subtitle: course.subtitle,
    excerpt: course.excerpt,
    date: course.date,
    status: course.status,
    content: {
      meta: course.meta,
      includes: course.includes,
      insights: course.insights,
      faq: course.faq,
      sections: course.sections,
    },
  };
}
