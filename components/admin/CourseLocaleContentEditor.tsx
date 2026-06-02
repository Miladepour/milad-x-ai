"use client";

import type { CourseLocaleContent } from "@/lib/courses/cms-types";
import type { CourseFaqItem } from "@/lib/courses/types";
import CourseSectionsEditor from "./CourseSectionsEditor";

interface CourseLocaleContentEditorProps {
  content: CourseLocaleContent;
  onChange: (content: CourseLocaleContent) => void;
}

function FaqEditor({
  faq,
  onChange,
}: {
  faq: CourseFaqItem[];
  onChange: (faq: CourseFaqItem[]) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">FAQ</p>
      {faq.map((item, index) => (
        <div key={item.id || index} className="flex flex-col gap-2 border border-surface/80 p-3">
          <input
            className="form-field font-mono text-xs"
            value={item.id}
            onChange={(e) => {
              const next = [...faq];
              next[index] = { ...item, id: e.target.value };
              onChange(next);
            }}
            placeholder="id (e.g. recorded)"
          />
          <input
            className="form-field text-sm"
            value={item.question}
            onChange={(e) => {
              const next = [...faq];
              next[index] = { ...item, question: e.target.value };
              onChange(next);
            }}
            placeholder="Question"
          />
          <textarea
            className="form-field min-h-16 text-sm"
            value={item.answer}
            onChange={(e) => {
              const next = [...faq];
              next[index] = { ...item, answer: e.target.value };
              onChange(next);
            }}
            placeholder="Answer"
          />
          <button
            type="button"
            onClick={() => onChange(faq.filter((_, i) => i !== index))}
            className="self-start font-mono text-[10px] uppercase text-cream/50 hover:text-orange"
          >
            Remove FAQ
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...faq,
            { id: `faq-${faq.length + 1}`, question: "", answer: "" },
          ])
        }
        className="self-start font-mono text-[10px] uppercase text-orange"
      >
        + Add FAQ
      </button>
    </div>
  );
}

export default function CourseLocaleContentEditor({
  content,
  onChange,
}: CourseLocaleContentEditorProps) {
  const { meta, insights } = content;

  const updateSession = (
    index: number,
    field: "id" | "date" | "time" | "durationHours",
    value: string | number
  ) => {
    const sessions = [...meta.sessions];
    const session = { ...sessions[index]! };
    if (field === "durationHours") {
      session.durationHours = Number(value) || 0;
    } else {
      session[field] = String(value);
    }
    sessions[index] = session;
    onChange({ ...content, meta: { ...meta, sessions } });
  };

  return (
    <div className="flex flex-col gap-6 mt-4 pt-4 border-t border-surface">
      <CourseSectionsEditor
        sections={content.sections}
        onChange={(sections) => onChange({ ...content, sections })}
      />

      <FaqEditor faq={content.faq} onChange={(faq) => onChange({ ...content, faq })} />

      <div className="flex flex-col gap-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
          Workshop meta
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="font-dm text-xs text-cream/70">
            Instructor
            <input
              className="form-field mt-1"
              value={meta.instructor}
              onChange={(e) =>
                onChange({ ...content, meta: { ...meta, instructor: e.target.value } })
              }
            />
          </label>
          <label className="font-dm text-xs text-cream/70">
            Format
            <input
              className="form-field mt-1"
              value={meta.format}
              onChange={(e) =>
                onChange({ ...content, meta: { ...meta, format: e.target.value } })
              }
            />
          </label>
          <label className="font-dm text-xs text-cream/70">
            Total hours (display)
            <input
              className="form-field mt-1"
              value={meta.totalHours}
              onChange={(e) =>
                onChange({ ...content, meta: { ...meta, totalHours: e.target.value } })
              }
            />
          </label>
          <label className="font-dm text-xs text-cream/70">
            Parts count
            <input
              type="number"
              min={0}
              className="form-field mt-1"
              value={meta.partsCount}
              onChange={(e) =>
                onChange({
                  ...content,
                  meta: { ...meta, partsCount: Number(e.target.value) || 0 },
                })
              }
            />
          </label>
          <label className="font-dm text-xs text-cream/70 sm:col-span-2">
            Timezone label
            <input
              className="form-field mt-1"
              value={meta.timezone}
              onChange={(e) =>
                onChange({ ...content, meta: { ...meta, timezone: e.target.value } })
              }
            />
          </label>
          <label className="font-dm text-xs text-cream/70 sm:col-span-2">
            Apply URL (optional)
            <input
              className="form-field mt-1 font-mono text-xs"
              value={meta.applyUrl ?? ""}
              onChange={(e) =>
                onChange({
                  ...content,
                  meta: {
                    ...meta,
                    applyUrl: e.target.value.trim() || null,
                  },
                })
              }
              placeholder="https://t.me/mxaiacademy — replaces waitlist button when set"
            />
          </label>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
          Sessions
        </p>
        {meta.sessions.map((session, index) => (
          <div
            key={session.id || index}
            className="grid gap-2 border border-surface/80 p-3 sm:grid-cols-4"
          >
            <input
              className="form-field font-mono text-xs"
              value={session.id}
              onChange={(e) => updateSession(index, "id", e.target.value)}
              placeholder="id"
            />
            <input
              className="form-field text-sm"
              value={session.date}
              onChange={(e) => updateSession(index, "date", e.target.value)}
              placeholder="Date"
            />
            <input
              className="form-field text-sm"
              value={session.time}
              onChange={(e) => updateSession(index, "time", e.target.value)}
              placeholder="Time (16:00)"
            />
            <input
              type="number"
              min={0}
              step={0.5}
              className="form-field text-sm"
              value={session.durationHours}
              onChange={(e) => updateSession(index, "durationHours", e.target.value)}
              placeholder="Hours"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange({
              ...content,
              meta: {
                ...meta,
                sessions: [
                  ...meta.sessions,
                  {
                    id: String(meta.sessions.length + 1),
                    date: "",
                    time: "",
                    durationHours: 0,
                  },
                ],
              },
            })
          }
          className="self-start font-mono text-[10px] uppercase text-orange"
        >
          + Add session
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
          Insights (sidebar)
        </p>
        <label className="font-dm text-xs text-cream/70">
          Topics count
          <input
            type="number"
            min={0}
            className="form-field mt-1 w-32"
            value={insights.topicsCount}
            onChange={(e) =>
              onChange({
                ...content,
                insights: {
                  ...insights,
                  topicsCount: Number(e.target.value) || 0,
                },
              })
            }
          />
        </label>
        <label className="font-dm text-xs text-cream/70">
          Audience (one per line)
          <textarea
            className="form-field mt-1 min-h-20 font-mono text-xs"
            value={insights.audience.join("\n")}
            onChange={(e) =>
              onChange({
                ...content,
                insights: {
                  ...insights,
                  audience: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                },
              })
            }
          />
        </label>
        <label className="font-dm text-xs text-cream/70">
          Requirements (one per line)
          <textarea
            className="form-field mt-1 min-h-20 font-mono text-xs"
            value={insights.requirements.join("\n")}
            onChange={(e) =>
              onChange({
                ...content,
                insights: {
                  ...insights,
                  requirements: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                },
              })
            }
          />
        </label>
      </div>
    </div>
  );
}
