import type { Course } from "../types";
import type { Locale } from "@/lib/i18n/translations";

type ComingSoonCopy = {
  listTitle: string;
  excerpt: string;
};

type ComingSoonDef = {
  slug: string;
  coverFile: string;
  EN: ComingSoonCopy;
  FA: ComingSoonCopy;
};

const COVER_DIR = "/images/courses/coming-soon";

const COMING_SOON_DEFS: ComingSoonDef[] = [
  {
    slug: "ai-fundamentals",
    coverFile: "ai-fundamentals-مبانی-پایه-هوش-مصنوعی.jpeg",
    FA: {
      listTitle: "مبانی پایه هوش مصنوعی",
      excerpt:
        "شروع اصولی کار با هوش مصنوعی؛ از شناخت ابزارها تا استفاده روزمره با دستورهای دقیق.",
    },
    EN: {
      listTitle: "AI Fundamentals",
      excerpt:
        "A practical start with AI: choose the right tools and use them confidently in everyday work.",
    },
  },
  {
    slug: "prompt-engineering",
    coverFile: "prompt-engineering-مهندسی-پرامپت.jpeg",
    FA: {
      listTitle: "مهندسی پرامپت",
      excerpt:
        "یاد بگیرید چطور پرامپت بنویسید تا خروجی‌های دقیق، قابل تکرار و حرفه‌ای بگیرید.",
    },
    EN: {
      listTitle: "Prompt Engineering",
      excerpt:
        "Learn to write prompts that produce precise, repeatable, professional results.",
    },
  },
  {
    slug: "ai-content-creation",
    coverFile: "ai-content-creation-تولید-محتوا-با-هوش-مصنوعی.jpeg",
    FA: {
      listTitle: "تولید محتوا با هوش مصنوعی",
      excerpt:
        "از ایده تا تصویر، ویدیو و کپشن؛ یک روند عملی برای تولید محتوا با هوش مصنوعی.",
    },
    EN: {
      listTitle: "Content Creation with AI",
      excerpt:
        "From idea to image, video, and caption: a practical system for creating content with AI.",
    },
  },
  {
    slug: "ai-agents",
    coverFile: "ai-agents-کار-با-ایجنت-های-هوش-مصنوعی.jpeg",
    FA: {
      listTitle: "کار با ایجنت های هوش مصنوعی",
      excerpt:
        "ایجنت‌ها را بشناسید و برای پژوهش، تولید و انجام کارها در کنار خودتان به کار بگیرید.",
    },
    EN: {
      listTitle: "Working with AI Agents",
      excerpt:
        "Learn what AI agents are and how to use them for research, production, and getting work done.",
    },
  },
  {
    slug: "ai-website-design",
    coverFile: "ai-website-design-طراحی-وبسایت-با-هوش-مصنوعی.jpeg",
    FA: {
      listTitle: "طراحی وبسایت با هوش مصنوعی",
      excerpt:
        "از ایده تا انتشار؛ طراحی و ساخت وبسایت با کمک ابزارهای هوش مصنوعی.",
    },
    EN: {
      listTitle: "Website Design with AI",
      excerpt:
        "From idea to publish: plan and build a website with AI-assisted design tools.",
    },
  },
  {
    slug: "ai-vibe-coding",
    coverFile: "ai-vibe-coding-وایب-کدینگ-با-هوش-مصنوعی.jpeg",
    FA: {
      listTitle: "وایب کدینگ با هوش مصنوعی",
      excerpt:
        "ایده‌تان را با کمک هوش مصنوعی به محصول دیجیتال واقعی تبدیل کنید.",
    },
    EN: {
      listTitle: "Vibe Coding with AI",
      excerpt:
        "Turn an idea into a real digital product with AI-assisted coding.",
    },
  },
];

function comingSoonCourse(def: ComingSoonDef, locale: Locale): Course {
  const copy = def[locale];
  const isFa = locale === "FA";

  return {
    slug: def.slug,
    listTitle: copy.listTitle,
    title: copy.listTitle,
    subtitle: copy.listTitle,
    excerpt: copy.excerpt,
    status: "Coming Soon",
    date: isFa ? "به زودی" : "Coming soon",
    coverImage: `${COVER_DIR}/${def.coverFile}`,
    priceUsd: 0,
    meta: {
      instructor: isFa ? "میلاد" : "Milad",
      format: isFa ? "دوره آنلاین" : "Online course",
      totalHours: isFa ? "اعلام می‌شود" : "To be announced",
      partsCount: 0,
      timezone: isFa ? "وقت لندن" : "London, UK time",
      sessions: [],
    },
    includes: [],
    insights: { audience: [], topicsCount: 0, requirements: [] },
    faq: [],
    sections: [],
  };
}

export const comingSoonCoursesEn: Course[] = COMING_SOON_DEFS.map((def) =>
  comingSoonCourse(def, "EN")
);

export const comingSoonCoursesFa: Course[] = COMING_SOON_DEFS.map((def) =>
  comingSoonCourse(def, "FA")
);

export const comingSoonSlugs = COMING_SOON_DEFS.map((def) => def.slug);
