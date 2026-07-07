import type {
  CourseAdminPayload,
  CourseListItem,
  CourseLocaleContent,
} from "./cms-types";
import type { Course, CourseStatus } from "./types";
import type { Locale } from "@/lib/i18n/translations";
import { joinCourseRow } from "@/lib/supabase/mappers";
import type { CourseLocaleRow, CourseRow } from "@/lib/supabase/database.types";
import { createAdminDbClient } from "@/lib/supabase/admin-client";
import { createCatalogClient } from "@/lib/supabase/catalog-client";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getAllStaticCourseAdminPayloads } from "./import-static";
import { parseCourseAdminPayload } from "./validate";
import { withResolvedApplyUrl } from "./apply-url";
import { sortCoursesByDate } from "./sort";
import { mergeWithStaticCatalog } from "./sync-static";

import {
  getCourseBySlug as getStaticCourseBySlug,
  getCourses as getStaticCourses,
  courseSlugs as staticCourseSlugs,
} from "./data/index";

function shouldUseStaticFallback(): boolean {
  return !isSupabaseConfigured();
}

/**
 * Public reads use Supabase when configured. Static data is only used when
 * Supabase env vars are missing (local dev without DB).
 */
async function withPublicReadFallback<T>(
  query: () => Promise<T>,
  fallback: () => T
): Promise<T> {
  if (shouldUseStaticFallback()) return fallback();
  return query();
}

async function fetchPublishedCourses(): Promise<
  Array<CourseRow & { course_locales: CourseLocaleRow[] }>
> {
  const supabase = createCatalogClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, course_locales(*)")
    .not("published_at", "is", null)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Array<CourseRow & { course_locales: CourseLocaleRow[] }>;
}

type CoursePreviewRow = Pick<CourseRow, "slug" | "cover_image" | "price_usd"> & {
  course_locales: Array<
    Pick<
      CourseLocaleRow,
      | "locale"
      | "list_title"
      | "title"
      | "subtitle"
      | "excerpt"
      | "date"
      | "status"
      | "price_toman"
      | "content"
    >
  >;
};

async function fetchPublishedCoursesPreview(): Promise<CoursePreviewRow[]> {
  const supabase = createCatalogClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      "slug, cover_image, price_usd, course_locales(locale, list_title, title, subtitle, excerpt, date, status, price_toman, content)"
    )
    .not("published_at", "is", null)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CoursePreviewRow[];
}

function joinCoursePreviewRow(row: CoursePreviewRow, localeRow: CourseLocaleRow): Course {
  const content = localeRow.content as unknown as CourseLocaleContent;
  return {
    slug: row.slug,
    listTitle: localeRow.list_title,
    title: localeRow.title,
    subtitle: localeRow.subtitle,
    excerpt: localeRow.excerpt,
    status: localeRow.status as CourseStatus,
    date: localeRow.date,
    coverImage: row.cover_image,
    priceUsd: Number(row.price_usd),
    priceToman:
      localeRow.price_toman != null ? Number(localeRow.price_toman) : null,
    meta: content.meta,
    includes: [],
    insights: { audience: [], topicsCount: 0, requirements: [] },
    faq: [],
    sections: [],
  };
}

export async function getCourses(locale: Locale): Promise<Course[]> {
  return withPublicReadFallback(async () => {
    const rows = await fetchPublishedCourses();
    const localeCode = locale;

    const courses = rows
      .map((row) => {
        const localeRow = row.course_locales?.find((l) => l.locale === localeCode);
        if (!localeRow) return null;
        const course = mergeWithStaticCatalog(
          joinCourseRow(row, localeRow),
          localeCode
        );
        return withResolvedApplyUrl(course);
      })
      .filter((c): c is Course => c !== null);

    return sortCoursesByDate(courses);
  }, () => getStaticCourses(locale));
}

/** Lightweight catalog read for the learn dashboard widget (same sort/filter rules). */
export async function getUpcomingCoursesPreview(
  locale: Locale,
  limit: number
): Promise<Course[]> {
  return withPublicReadFallback(async () => {
    const rows = await fetchPublishedCoursesPreview();
    const localeCode = locale;

    const courses = rows
      .map((row) => {
        const localeRow = row.course_locales?.find((l) => l.locale === localeCode);
        if (!localeRow) return null;
        return mergeWithStaticCatalog(
          joinCoursePreviewRow(row, localeRow as CourseLocaleRow),
          localeCode
        );
      })
      .filter((c): c is Course => c !== null);

    return sortCoursesByDate(courses)
      .filter((course) => course.status !== "Closed")
      .slice(0, limit);
  }, () =>
    getStaticCourses(locale)
      .filter((course) => course.status !== "Closed")
      .slice(0, limit)
  );
}

export async function getCourseBySlug(
  slug: string,
  locale: Locale
): Promise<Course | undefined> {
  return withPublicReadFallback(async () => {
    const supabase = createCatalogClient();
    const { data, error } = await supabase
      .from("courses")
      .select("*, course_locales(*)")
      .eq("slug", slug)
      .not("published_at", "is", null)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return undefined;

    const row = data as CourseRow & { course_locales: CourseLocaleRow[] };
    const localeRow = row.course_locales?.find((l) => l.locale === locale);
    if (!localeRow) return undefined;
    const course = mergeWithStaticCatalog(joinCourseRow(row, localeRow), locale);
    return withResolvedApplyUrl(course);
  }, () => {
    const course = getStaticCourseBySlug(slug, locale);
    return course ? withResolvedApplyUrl(course) : undefined;
  });
}

export async function getAllCourseSlugs(): Promise<string[]> {
  return withPublicReadFallback(async () => {
    const supabase = createCatalogClient();
    const { data, error } = await supabase
      .from("courses")
      .select("slug")
      .not("published_at", "is", null);

    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.slug);
  }, () => staticCourseSlugs);
}

export async function isPublishedCourseSlug(slug: string): Promise<boolean> {
  return withPublicReadFallback(async () => {
    const supabase = createCatalogClient();
    const { data, error } = await supabase
      .from("courses")
      .select("slug")
      .eq("slug", slug)
      .not("published_at", "is", null)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return Boolean(data);
  }, () => staticCourseSlugs.includes(slug));
}

export async function listCoursesAdmin(): Promise<CourseListItem[]> {
  const supabase = createAdminDbClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, course_locales(*)")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as Array<CourseRow & { course_locales: CourseLocaleRow[] }>).map(
    (row) => {
      const en = row.course_locales?.find((l) => l.locale === "EN");
      const fa = row.course_locales?.find((l) => l.locale === "FA");
      return {
        slug: row.slug,
        coverImage: row.cover_image,
        priceUsd: Number(row.price_usd),
        sortOrder: row.sort_order,
        publishedAt: row.published_at,
        enTitle: en?.list_title ?? "—",
        enStatus: (en?.status ?? "Coming Soon") as CourseListItem["enStatus"],
        faTitle: fa?.list_title ?? "—",
        faStatus: (fa?.status ?? "Coming Soon") as CourseListItem["faStatus"],
      };
    }
  );
}

export async function getCourseAdmin(slug: string): Promise<CourseAdminPayload | null> {
  const supabase = createAdminDbClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, course_locales(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as CourseRow & { course_locales: CourseLocaleRow[] };
  const en = row.course_locales?.find((l) => l.locale === "EN");
  const fa = row.course_locales?.find((l) => l.locale === "FA");
  if (!en || !fa) return null;

  const enContent = en.content as unknown as CourseLocaleContent;
  const faContent = fa.content as unknown as CourseLocaleContent;

  return {
    slug: row.slug,
    coverImage: row.cover_image,
    priceUsd: Number(row.price_usd),
    sortOrder: row.sort_order,
    publishedAt: row.published_at,
    locales: {
      EN: {
        listTitle: en.list_title,
        title: en.title,
        subtitle: en.subtitle,
        excerpt: en.excerpt,
        date: en.date,
        status: en.status as CourseAdminPayload["locales"]["EN"]["status"],
        priceToman: null,
        content: enContent,
      },
      FA: {
        listTitle: fa.list_title,
        title: fa.title,
        subtitle: fa.subtitle,
        excerpt: fa.excerpt,
        date: fa.date,
        status: fa.status as CourseAdminPayload["locales"]["FA"]["status"],
        priceToman:
          fa.price_toman != null ? Number(fa.price_toman) : null,
        content: faContent,
      },
    },
  };
}

export async function upsertCourse(raw: unknown): Promise<CourseAdminPayload> {
  const payload = parseCourseAdminPayload(raw);
  const supabase = createAdminDbClient();

  const { data: existing } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", payload.slug)
    .maybeSingle();

  let courseId = existing?.id as string | undefined;

  const courseRow = {
    slug: payload.slug,
    cover_image: payload.coverImage,
    price_usd: payload.priceUsd,
    sort_order: payload.sortOrder,
    published_at: payload.publishedAt,
  };

  if (courseId) {
    const { error } = await supabase
      .from("courses")
      .update(courseRow)
      .eq("id", courseId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("courses")
      .insert(courseRow)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    courseId = data.id;
  }

  for (const locale of ["EN", "FA"] as const) {
    const loc = payload.locales[locale];
    const localeRow = {
      course_id: courseId!,
      locale,
      list_title: loc.listTitle,
      title: loc.title,
      subtitle: loc.subtitle,
      excerpt: loc.excerpt,
      date: loc.date,
      status: loc.status,
      price_toman:
        locale === "FA" && loc.priceToman != null && loc.priceToman > 0
          ? loc.priceToman
          : null,
      content: loc.content as unknown as Record<string, unknown>,
    };

    const { error } = await supabase.from("course_locales").upsert(localeRow, {
      onConflict: "course_id,locale",
    });
    if (error) throw new Error(error.message);
  }

  const saved = await getCourseAdmin(payload.slug);
  if (!saved) throw new Error("Failed to load saved course");
  return saved;
}

export async function importStaticCourses(): Promise<CourseAdminPayload[]> {
  const payloads = getAllStaticCourseAdminPayloads();
  const saved: CourseAdminPayload[] = [];
  for (const payload of payloads) {
    saved.push(await upsertCourse(payload));
  }
  return saved;
}

