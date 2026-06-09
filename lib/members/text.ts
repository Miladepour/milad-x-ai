function toPlainText(content: string): string {
  return content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s*[—–]\s*/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Plain-text preview from HTML or markdown-ish lesson copy. */
export function previewText(content: string, maxLength = 140): string {
  const plain = toPlainText(content);
  if (!plain) return "";
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}…`;
}

/** Short excerpt for cards (no em dashes). */
export function displayExcerpt(content: string, maxLength = 100): string {
  return previewText(content, maxLength);
}
