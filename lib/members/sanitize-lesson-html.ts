import sanitizeHtml from "sanitize-html";

export function sanitizeLessonHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "pre",
      "code",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      code: ["class"],
      pre: ["class"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noreferrer noopener" }),
    },
  });
}
