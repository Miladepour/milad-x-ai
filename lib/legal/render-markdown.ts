function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text: string): string {
  const escaped = escapeHtml(text);
  return escaped.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label: string, href: string) =>
      `<a href="${escapeHtml(href)}">${label}</a>`
  );
}

export function renderLegalMarkdown(markdown: string): string {
  const blocks = markdown.trim().split(/\n{2,}/);
  const parts: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("# ")) {
      const lines = trimmed.split("\n");
      parts.push(`<h1>${renderInline(lines[0].slice(2).trim())}</h1>`);
      if (lines.length > 1) {
        parts.push(`<p>${renderInline(lines.slice(1).join(" ").trim())}</p>`);
      }
      continue;
    }

    if (trimmed.startsWith("## ")) {
      parts.push(`<h2>${renderInline(trimmed.slice(3).trim())}</h2>`);
      continue;
    }

    const paragraphs = trimmed.split("\n").filter(Boolean);
    for (const paragraph of paragraphs) {
      parts.push(`<p>${renderInline(paragraph.trim())}</p>`);
    }
  }

  return parts.join("\n");
}
