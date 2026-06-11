import { readFileSync } from "fs";
import { join } from "path";
import sanitizeHtml from "sanitize-html";
import type { LocaleCode } from "@/lib/supabase/database.types";
import { renderLegalMarkdown } from "./render-markdown";

const LEGAL_DIR = join(process.cwd(), "content/legal");

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["h1", "h2", "p", "a", "strong", "em", "ul", "ol", "li", "br"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noreferrer noopener" }),
  },
};

function legalFilename(basename: string, locale: LocaleCode): string {
  return `${basename}.${locale === "FA" ? "fa" : "en"}.md`;
}

function loadLegalHtml(basename: string, locale: LocaleCode): string {
  const raw = readFileSync(join(LEGAL_DIR, legalFilename(basename, locale)), "utf8");
  const html = renderLegalMarkdown(raw);
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

export function getTermsAndConditionsHtml(locale: LocaleCode): string {
  return loadLegalHtml("terms-and-conditions", locale);
}

export function getPrivacyPolicyHtml(locale: LocaleCode): string {
  return loadLegalHtml("privacy-policy", locale);
}
