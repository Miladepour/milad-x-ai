import type { CourseAdminPayload } from "./cms-types";

export function payloadToJsonString(payload: CourseAdminPayload): string {
  return JSON.stringify(payload, null, 2);
}

export function parseJsonToPayload(raw: string): CourseAdminPayload {
  const parsed = JSON.parse(raw) as unknown;
  return parsed as CourseAdminPayload;
}

export function emptyCourseAdminPayload(): CourseAdminPayload {
  return {
    slug: "",
    coverImage: "/images/milad-ai-prompt-to-content-master-class.jpeg",
    priceUsd: 0,
    sortOrder: 0,
    publishedAt: null,
    locales: {
      EN: {
        listTitle: "",
        title: "",
        subtitle: "",
        excerpt: "",
        date: "",
        status: "Coming Soon",
        content: {
          meta: {
            instructor: "Milad",
            format: "Live online workshop",
            totalHours: "",
            partsCount: 1,
            timezone: "London, UK time",
            sessions: [{ id: "1", date: "", time: "", durationHours: 0 }],
          },
          includes: [{ text: "" }],
          insights: { audience: [], topicsCount: 0, requirements: [] },
          faq: [{ id: "faq-1", question: "", answer: "" }],
          sections: [
            {
              id: "intro",
              title: "About the course",
              blocks: [{ type: "paragraph", text: "" }],
            },
          ],
        },
      },
      FA: {
        listTitle: "",
        title: "",
        subtitle: "",
        excerpt: "",
        date: "",
        status: "Coming Soon",
        content: {
          meta: {
            instructor: "میلاد",
            format: "ورکشاپ آنلاین زنده",
            totalHours: "",
            partsCount: 1,
            timezone: "وقت لندن",
            sessions: [{ id: "1", date: "", time: "", durationHours: 0 }],
          },
          includes: [{ text: "" }],
          insights: { audience: [], topicsCount: 0, requirements: [] },
          faq: [{ id: "faq-1", question: "", answer: "" }],
          sections: [
            {
              id: "intro",
              title: "درباره دوره",
              blocks: [{ type: "paragraph", text: "" }],
            },
          ],
        },
      },
    },
  };
}
