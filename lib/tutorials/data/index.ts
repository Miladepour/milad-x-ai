import type { Tutorial } from "../types";
import { aksVideoMahsulFa } from "./aks-video-mahsul-fa";
import { claudeAiAzPayeFa } from "./claude-ai-az-paye-fa";
import { claudeAiFa } from "./claude-ai-fa";
import { claudeMotionGraphicsFa } from "./claude-motion-graphics-fa";
import { claudeTokenSarfeJoeeFa } from "./claude-token-sarfe-joee-fa";
import { hyperframesVideoEditFa } from "./hyperframes-video-edit-fa";
import { obsidianMaghzDovomFa } from "./obsidian-maghz-dovom-fa";
import { sakhtVideoBaHooshMasnoeiFa } from "./sakht-video-ba-hoosh-masnoei-fa";

/** Code-defined tutorials — add new entries here when publishing lessons. Newest first. */
export const tutorials: Tutorial[] = [
  obsidianMaghzDovomFa,
  aksVideoMahsulFa,
  claudeAiAzPayeFa,
  hyperframesVideoEditFa,
  claudeMotionGraphicsFa,
  claudeTokenSarfeJoeeFa,
  claudeAiFa,
  sakhtVideoBaHooshMasnoeiFa,
];

export function getTutorials(locale: "EN" | "FA"): Tutorial[] {
  return tutorials
    .filter((t) => t.locale === locale)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function getTutorialBySlug(
  slug: string,
  locale: "EN" | "FA"
): Tutorial | null {
  return tutorials.find((t) => t.slug === slug && t.locale === locale) ?? null;
}

export function getTutorialSlugs(): string[] {
  return Array.from(new Set(tutorials.map((t) => t.slug)));
}
