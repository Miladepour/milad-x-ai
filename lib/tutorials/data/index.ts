import type { Tutorial } from "../types";
import { claudeAiFa } from "./claude-ai-fa";
import { claudeMotionGraphicsFa } from "./claude-motion-graphics-fa";
import { claudeTokenSarfeJoeeFa } from "./claude-token-sarfe-joee-fa";
import { hyperframesVideoEditFa } from "./hyperframes-video-edit-fa";
import { sakhtVideoBaHooshMasnoeiFa } from "./sakht-video-ba-hoosh-masnoei-fa";

/** Code-defined tutorials — add new entries here when publishing lessons. */
export const tutorials: Tutorial[] = [
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
