import type { Locale } from "./translations";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"] as const;

/** Convert Western digits in a string/number to Persian numerals when locale is FA */
export function toLocaleDigits(value: string | number, locale: Locale): string {
  const text = String(value);
  if (locale !== "FA") return text;
  return text.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}
