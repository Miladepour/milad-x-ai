import { Node, mergeAttributes } from "@tiptap/core";

export const EMAIL_BUTTON_STYLE =
  "display:inline-block;background-color:#FF5C00;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:4px;font-weight:600;font-size:16px;";

export const EmailButton = Node.create({
  name: "emailButton",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      href: { default: "" },
      label: { default: "Learn more" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "p",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const anchor = element.querySelector('a[data-email-button="true"]');
          if (!anchor) return false;
          return {
            href: anchor.getAttribute("href") ?? "",
            label: anchor.textContent?.trim() || "Learn more",
          };
        },
      },
      {
        tag: 'a[data-email-button="true"]',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          return {
            href: element.getAttribute("href") ?? "",
            label: element.textContent?.trim() || "Learn more",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const href = String(HTMLAttributes.href ?? "").trim() || "#";
    const label = String(HTMLAttributes.label ?? "Learn more").trim() || "Learn more";

    return [
      "p",
      { style: "text-align:center;margin:24px 0;" },
      [
        "a",
        mergeAttributes(HTMLAttributes, {
          "data-email-button": "true",
          href,
          style: EMAIL_BUTTON_STYLE,
          rel: "noopener noreferrer",
          target: "_blank",
        }),
        label,
      ],
    ];
  },
});
