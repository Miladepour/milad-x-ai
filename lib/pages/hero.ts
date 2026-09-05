import fs from "node:fs";
import path from "node:path";
import { SITE_URL, type UrlLocale } from "@/lib/i18n/config";

export const PAGE_HERO_PUBLIC_DIR = "/images/pages-hero";
export const PAGE_HERO_ASPECT = "21 / 9";
export const PAGE_HERO_WIDTH = 2520;
export const PAGE_HERO_HEIGHT = 1080;

const PAGE_HERO_FS_DIR = path.join(process.cwd(), "public/images/pages-hero");
const EXTENSIONS = [".jpg", ".jpeg", ".webp", ".png"] as const;

function hasHeroExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function heroPublicUrl(filename: string): string {
  return `${PAGE_HERO_PUBLIC_DIR}/${encodeURIComponent(filename)}`;
}

export function getPageHeroSrc(pageId: string, locale?: UrlLocale): string | null {
  const stems = locale ? [`${pageId}-${locale}`, pageId] : [pageId];

  for (const stem of stems) {
    for (const ext of EXTENSIONS) {
      const filename = `${stem}${ext}`;
      if (fs.existsSync(path.join(PAGE_HERO_FS_DIR, filename))) {
        return heroPublicUrl(filename);
      }
    }
  }

  if (!fs.existsSync(PAGE_HERO_FS_DIR)) return null;

  const id = pageId.toLowerCase();
  const bilingual = fs
    .readdirSync(PAGE_HERO_FS_DIR)
    .filter((file) => {
      if (!hasHeroExtension(file)) return false;
      const lower = file.toLowerCase();
      return lower.startsWith(`${id}-`) || lower.startsWith(`${id} `);
    })
    .sort();

  return bilingual[0] ? heroPublicUrl(bilingual[0]) : null;
}

export function getPageHeroAbsoluteUrl(pageId: string, locale?: UrlLocale): string | null {
  const src = getPageHeroSrc(pageId, locale);
  return src ? `${SITE_URL}${src}` : null;
}
