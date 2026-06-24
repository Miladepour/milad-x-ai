import { getCountryName } from "@/lib/countries";

export function formatAudienceCountryLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const upper = trimmed.toUpperCase();
  const name = getCountryName(upper);
  return name ? `${name} (${upper})` : trimmed;
}
