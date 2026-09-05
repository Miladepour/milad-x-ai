import fs from "node:fs";
import path from "node:path";
import { SITE_URL, type UrlLocale } from "@/lib/i18n/config";

export const PAGE_HERO_PUBLIC_DIR = "/images/pages-hero";
export const PAGE_HERO_ASPECT = "21 / 9";
export const PAGE_HERO_WIDTH = 2520;
export const PAGE_HERO_HEIGHT = 1080;

const PAGE_HERO_FS_DIR = path.join(process.cwd(), "public/images/pages-hero");
const EXTENSIONS = [".jpg", ".jpeg", ".webp", ".png"] as const;

function heroFileUrl(stem: string, ext: (typeof EXTENSIONS)[number]): string {
  return `${PAGE_HERO_PUBLIC_DIR}/${stem}${ext}`;
}

export function getPageHeroSrc(pageId: string, locale?: UrlLocale): string | null {
  const stems = locale ? [`${pageId}-${locale}`, pageId] : [pageId];

  for (const stem of stems) {
    for (const ext of EXTENSIONS) {
      if (fs.existsSync(path.join(PAGE_HERO_FS_DIR, `${stem}${ext}`))) {
        return heroFileUrl(stem, ext);
      }
    }
  }

  return null;
}

export function getPageHeroAbsoluteUrl(pageId: string, locale?: UrlLocale): string | null {
  const src = getPageHeroSrc(pageId, locale);
  return src ? `${SITE_URL}${src}` : null;
}
