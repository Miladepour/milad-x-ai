import type { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/lib/blog/store";
import { courseSlugs } from "@/lib/courses";
import { locales, SITE_URL, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";

function alternatesFor(logicalPath: string) {
  return Object.fromEntries(
    locales.map((l) => [l, `${SITE_URL}${localizedPath(logicalPath, l)}`])
  );
}

function entry(logicalPath: string, locale: UrlLocale): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${localizedPath(logicalPath, locale)}`,
    lastModified: new Date(),
    alternates: {
      languages: alternatesFor(logicalPath),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["/", "/contact", "/blog", "/courses"];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push(entry(path, locale));
    }

    for (const slug of courseSlugs) {
      entries.push(entry(`/courses/${slug}`, locale));
      entries.push(entry(`/courses/${slug}/waitlist`, locale));
    }
  }

  const blogSlugs = await getAllBlogSlugs();
  for (const locale of locales) {
    for (const slug of blogSlugs) {
      entries.push(entry(`/blog/${slug}`, locale));
    }
  }

  return entries;
}
