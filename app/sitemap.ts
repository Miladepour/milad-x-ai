import type { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/lib/blog/store";
import { getTutorialSlugs } from "@/lib/tutorials/data";
import { courseUsesExternalApply } from "@/lib/courses/registration";
import { getAllCourseSlugs, getCourses } from "@/lib/courses/store";
import { courseSlugs as staticCourseSlugs } from "@/lib/courses/data/index";
import { locales, SITE_URL, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import {
  PUBLIC_SITEMAP_PATHS,
  shouldIncludeLogicalPathInSitemap,
} from "@/lib/seo/private-paths";

export const dynamic = "force-dynamic";

function alternatesFor(logicalPath: string) {
  return Object.fromEntries(
    locales.map((l) => [l, `${SITE_URL}${localizedPath(logicalPath, l)}`])
  );
}

function entry(logicalPath: string, locale: UrlLocale): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${localizedPath(logicalPath, locale)}`,
    lastModified: new Date(),
    changeFrequency: logicalPath === "/" ? "weekly" : "monthly",
    priority: logicalPath === "/" ? 1 : logicalPath.startsWith("/courses") ? 0.9 : 0.7,
    alternates: {
      languages: alternatesFor(logicalPath),
    },
  };
}

function addEntry(
  entries: MetadataRoute.Sitemap,
  logicalPath: string,
  locale: UrlLocale
) {
  if (!shouldIncludeLogicalPathInSitemap(logicalPath)) return;
  entries.push(entry(logicalPath, locale));
}

async function safeCourseSlugs(): Promise<string[]> {
  try {
    const slugs = await getAllCourseSlugs();
    return slugs.length > 0 ? slugs : staticCourseSlugs;
  } catch {
    return staticCourseSlugs;
  }
}

async function safeBlogSlugs(): Promise<string[]> {
  try {
    return await getAllBlogSlugs();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courseSlugs, blogSlugs, coursesEn] = await Promise.all([
    safeCourseSlugs(),
    safeBlogSlugs(),
    getCourses("EN").catch(() => []),
  ]);

  const waitlistSlugs = new Set(
    coursesEn.filter((course) => !courseUsesExternalApply(course)).map((course) => course.slug)
  );

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of PUBLIC_SITEMAP_PATHS) {
      addEntry(entries, path, locale);
    }

    for (const slug of courseSlugs) {
      addEntry(entries, `/courses/${slug}`, locale);
      if (waitlistSlugs.size === 0 || waitlistSlugs.has(slug)) {
        addEntry(entries, `/courses/${slug}/waitlist`, locale);
      }
    }

    for (const slug of blogSlugs) {
      addEntry(entries, `/blog/${slug}`, locale);
    }

    for (const slug of getTutorialSlugs()) {
      addEntry(entries, `/free-ai-tutorials/${slug}`, locale);
    }
  }

  return entries;
}
