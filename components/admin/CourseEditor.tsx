"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { CourseAdminPayload, CourseListItem } from "@/lib/courses/cms-types";
import type { CourseStatus } from "@/lib/courses/types";
import { normalizeSlug, parseCourseAdminPayload } from "@/lib/courses/validate";
import {
  emptyCourseAdminPayload,
  payloadToJsonString,
  parseJsonToPayload,
} from "@/lib/courses/editor-defaults";

type EditorMode = "form" | "json";

interface CourseEditorProps {
  adminRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onStatus: (message: string) => void;
}

const STATUSES: CourseStatus[] = ["Live", "Coming Soon", "Closed"];

function LabeledField({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 font-dm text-xs text-cream/80 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-widest text-orange">{label}</span>
      {hint ? <span className="text-cream/50 normal-case tracking-normal">{hint}</span> : null}
      {children}
    </label>
  );
}

function LocaleFields({
  label,
  locale,
  data,
  onChange,
}: {
  label: string;
  locale: "EN" | "FA";
  data: CourseAdminPayload["locales"]["EN"];
  onChange: (next: CourseAdminPayload["locales"]["EN"]) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border border-surface bg-surface/20 p-4">
      <h3 className="font-mono text-xs uppercase tracking-widest text-orange">{label}</h3>
      <LabeledField label="List title (card / menu)">
        <input
          className="form-field"
          value={data.listTitle}
          onChange={(e) => onChange({ ...data, listTitle: e.target.value })}
        />
      </LabeledField>
      <LabeledField label="Page title">
        <input
          className="form-field"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
        />
      </LabeledField>
      <LabeledField label="Subtitle">
        <input
          className="form-field"
          value={data.subtitle}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
        />
      </LabeledField>
      <LabeledField label="Excerpt">
        <textarea
          className="form-field min-h-20"
          value={data.excerpt}
          onChange={(e) => onChange({ ...data, excerpt: e.target.value })}
        />
      </LabeledField>
      <LabeledField label="Display date">
        <input
          className="form-field"
          value={data.date}
          onChange={(e) => onChange({ ...data, date: e.target.value })}
        />
      </LabeledField>
      <LabeledField label="Status">
        <select
          className="form-field"
          value={data.status}
          onChange={(e) =>
            onChange({ ...data, status: e.target.value as CourseStatus })
          }
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </LabeledField>
      {locale === "FA" && (
        <LabeledField
          label="Price (million Toman, Iran)"
          hint="Optional. Enter millions, e.g. 2.5 for 2.5 million Toman. USD is set above."
        >
          <input
            type="number"
            min={0}
            step={0.1}
            className="form-field"
            value={data.priceToman ?? ""}
            onChange={(e) => {
              const raw = e.target.value.trim();
              onChange({
                ...data,
                priceToman:
                  raw === "" ? null : Math.round(Number(raw) * 100) / 100,
              });
            }}
          />
        </LabeledField>
      )}
      <label className="font-dm text-xs text-cream/70">
        Includes (one per line)
        <textarea
          className="form-field mt-1 min-h-24 font-mono text-xs"
          value={data.content.includes.map((i) => i.text).join("\n")}
          onChange={(e) =>
            onChange({
              ...data,
              content: {
                ...data.content,
                includes: e.target.value
                  .split("\n")
                  .map((text) => text.trim())
                  .filter(Boolean)
                  .map((text) => ({ text })),
              },
            })
          }
        />
      </label>
      <label className="font-dm text-xs text-cream/70">
        FAQ JSON
        <textarea
          className="form-field mt-1 min-h-28 font-mono text-xs"
          value={JSON.stringify(data.content.faq, null, 2)}
          onChange={(e) => {
            try {
              const faq = JSON.parse(e.target.value) as CourseAdminPayload["locales"]["EN"]["content"]["faq"];
              onChange({ ...data, content: { ...data.content, faq } });
            } catch {
              // ignore while typing
            }
          }}
          onBlur={(e) => {
            try {
              const faq = JSON.parse(e.target.value);
              onChange({ ...data, content: { ...data.content, faq } });
            } catch {
              /* validation on publish */
            }
          }}
        />
      </label>
      <label className="font-dm text-xs text-cream/70">
        Sections JSON
        <textarea
          className="form-field mt-1 min-h-40 font-mono text-xs"
          value={JSON.stringify(data.content.sections, null, 2)}
          onBlur={(e) => {
            try {
              const sections = JSON.parse(e.target.value);
              onChange({ ...data, content: { ...data.content, sections } });
            } catch {
              /* validation on publish */
            }
          }}
          onChange={(e) => {
            try {
              const sections = JSON.parse(e.target.value);
              onChange({ ...data, content: { ...data.content, sections } });
            } catch {
              /* ignore */
            }
          }}
        />
      </label>
      <label className="font-dm text-xs text-cream/70">
        Meta & insights JSON
        <textarea
          className="form-field mt-1 min-h-32 font-mono text-xs"
          value={JSON.stringify(
            { meta: data.content.meta, insights: data.content.insights },
            null,
            2
          )}
          onBlur={(e) => {
            try {
              const parsed = JSON.parse(e.target.value) as {
                meta: typeof data.content.meta;
                insights: typeof data.content.insights;
              };
              onChange({
                ...data,
                content: {
                  ...data.content,
                  meta: parsed.meta,
                  insights: parsed.insights,
                },
              });
            } catch {
              /* validation on publish */
            }
          }}
        />
      </label>
    </div>
  );
}

export default function CourseEditor({ adminRequest, onStatus }: CourseEditorProps) {
  const [view, setView] = useState<"list" | "edit">("list");
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [mode, setMode] = useState<EditorMode>("form");
  const [payload, setPayload] = useState<CourseAdminPayload>(emptyCourseAdminPayload());
  const [jsonText, setJsonText] = useState(payloadToJsonString(emptyCourseAdminPayload()));
  const [slugEdited, setSlugEdited] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadList = useCallback(async () => {
    const data = (await adminRequest("list-courses")) as { courses: CourseListItem[] };
    setCourses(data.courses ?? []);
  }, [adminRequest]);

  useEffect(() => {
    loadList().catch((e) =>
      onStatus(e instanceof Error ? e.message : "Could not load courses")
    );
  }, [loadList, onStatus]);

  const openNew = () => {
    const empty = emptyCourseAdminPayload();
    setPayload(empty);
    setJsonText(payloadToJsonString(empty));
    setSlugEdited(false);
    setMode("form");
    setView("edit");
  };

  const openEdit = async (slug: string) => {
    onStatus("Loading course...");
    const data = (await adminRequest("get-course", { slug })) as {
      course: CourseAdminPayload | null;
    };
    if (!data.course) {
      onStatus("Course not found");
      return;
    }
    setPayload(data.course);
    setJsonText(payloadToJsonString(data.course));
    setSlugEdited(true); // existing course — don't auto-overwrite slug
    setMode("form");
    setView("edit");
    onStatus("");
  };

  const switchMode = (next: EditorMode) => {
    if (next === mode) return;
    if (next === "json") {
      setJsonText(payloadToJsonString(payload));
    } else {
      try {
        const parsed = parseJsonToPayload(jsonText);
        setPayload(parsed);
      } catch (e) {
        onStatus(e instanceof Error ? e.message : "Invalid JSON");
        return;
      }
    }
    setMode(next);
  };

  const handlePublish = async (event: FormEvent) => {
    event.preventDefault();
    onStatus("Publishing course...");
    try {
      let toPublish = payload;
      if (mode === "json") {
        toPublish = parseJsonToPayload(jsonText);
      }
      parseCourseAdminPayload(toPublish);
      const data = (await adminRequest("publish-course", {
        course: { ...toPublish, publishedAt: new Date().toISOString() },
        publishNow: true,
      })) as { course: CourseAdminPayload };
      setPayload(data.course);
      setJsonText(payloadToJsonString(data.course));
      onStatus(`Published: ${data.course.slug}`);
      await loadList();
      setView("list");
    } catch (e) {
      onStatus(e instanceof Error ? e.message : "Could not publish course");
    }
  };

  const handleImportStatic = async () => {
    onStatus("Importing from codebase...");
    try {
      await adminRequest("import-static-courses");
      onStatus("Imported prompt-to-content course.");
      await loadList();
    } catch (e) {
      onStatus(e instanceof Error ? e.message : "Import failed");
    }
  };

  if (view === "list") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openNew}
            className="bg-orange px-4 py-2 font-mono text-xs uppercase tracking-widest text-background"
          >
            New course
          </button>
          <button
            type="button"
            onClick={() => handleImportStatic()}
            className="border border-orange px-4 py-2 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
          >
            Import from codebase
          </button>
          <button
            type="button"
            onClick={() => loadList()}
            className="border border-surface px-4 py-2 font-mono text-xs uppercase tracking-widest text-cream"
          >
            Refresh
          </button>
        </div>

        {courses.length === 0 ? (
          <p className="font-dm text-cream/70">
            No courses in database yet. Click &quot;Import from codebase&quot; to load the
            existing workshop, or create a new course.
          </p>
        ) : (
          <ul className="grid gap-3">
            {courses.map((c) => (
              <li
                key={c.slug}
                className="flex flex-wrap items-center justify-between gap-3 border border-surface bg-surface/25 p-4"
              >
                <div>
                  <p className="font-dm font-semibold text-cream">{c.enTitle}</p>
                  <p className="font-mono text-xs text-cream/60">
                    {c.slug} · EN: {c.enStatus}
                    {c.publishedAt ? " · Published" : " · Draft"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(c.slug)}
                  className="border border-orange px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-orange"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handlePublish} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setView("list")}
          className="border border-surface px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-cream"
        >
          Back to list
        </button>
        <button
          type="button"
          onClick={() => switchMode("form")}
          className={`px-3 py-1.5 font-mono text-xs uppercase tracking-widest ${
            mode === "form" ? "bg-orange text-background" : "border border-surface text-cream"
          }`}
        >
          Form
        </button>
        <button
          type="button"
          onClick={() => switchMode("json")}
          className={`px-3 py-1.5 font-mono text-xs uppercase tracking-widest ${
            mode === "json" ? "bg-orange text-background" : "border border-surface text-cream"
          }`}
        >
          JSON
        </button>
      </div>

      <div className="grid gap-4 border border-surface bg-surface/20 p-4 md:grid-cols-2">
        {/* Slug — auto-generated from EN list title, editable */}
        <LabeledField
          label="Slug (URL)"
          hint="Auto-filled from English title. Edit if needed."
          className="md:col-span-2"
        >
          <input
            className="form-field font-mono"
            value={payload.slug}
            onChange={(e) => {
              setSlugEdited(true);
              setPayload({ ...payload, slug: e.target.value });
            }}
          />
        </LabeledField>

        {/* Cover image upload */}
        <LabeledField
          label="Cover image"
          hint="Upload a JPEG, PNG or WebP (max 5 MB). The URL is saved automatically."
          className="md:col-span-2"
        >
          <div className="flex flex-col gap-3">
            {/* Preview */}
            {payload.coverImage && (
              <div className="relative h-36 w-full overflow-hidden rounded-sm border border-surface bg-background">
                <Image
                  src={payload.coverImage}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                  sizes="600px"
                  unoptimized={payload.coverImage.startsWith("http")}
                />
              </div>
            )}

            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImageUploading(true);
                onStatus("Uploading image…");
                try {
                  const form = new FormData();
                  form.append("file", file);
                  form.append("slug", payload.slug || "course");
                  const res = await fetch("/api/admin-upload", {
                    method: "POST",
                    body: form,
                  });
                  const json = (await res.json()) as { ok?: boolean; url?: string; error?: string };
                  if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
                  setPayload((prev) => ({ ...prev, coverImage: json.url! }));
                  onStatus("Image uploaded ✓");
                } catch (err) {
                  onStatus(err instanceof Error ? err.message : "Upload failed");
                } finally {
                  setImageUploading(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }
              }}
            />
            <div className="flex gap-2 items-center flex-wrap">
              <button
                type="button"
                disabled={imageUploading}
                onClick={() => fileInputRef.current?.click()}
                className="border border-orange px-4 py-2 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {imageUploading ? "Uploading…" : payload.coverImage ? "Replace image" : "Upload image"}
              </button>
              {/* Manual URL override */}
              <input
                className="form-field flex-1 min-w-0 font-mono text-xs"
                placeholder="Or paste a URL / path"
                value={payload.coverImage}
                onChange={(e) => setPayload({ ...payload, coverImage: e.target.value })}
              />
            </div>
          </div>
        </LabeledField>

        <LabeledField label="Price (USD)" hint="Shown on EN and FA pages">
          <input
            type="number"
            min={0}
            step={1}
            className="form-field"
            value={payload.priceUsd}
            onChange={(e) =>
              setPayload({ ...payload, priceUsd: Number(e.target.value) })
            }
          />
        </LabeledField>
        <LabeledField label="Sort order" hint="Lower numbers appear first in listings">
          <input
            type="number"
            className="form-field"
            value={payload.sortOrder}
            onChange={(e) =>
              setPayload({ ...payload, sortOrder: Number(e.target.value) })
            }
          />
        </LabeledField>
      </div>

      {mode === "json" ? (
        <textarea
          className="form-field min-h-[480px] font-mono text-xs"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          spellCheck={false}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <LocaleFields
            label="English"
            locale="EN"
            data={payload.locales.EN}
            onChange={(EN) => {
              // Auto-generate slug from English list title unless user has manually edited it
              const next: CourseAdminPayload = { ...payload, locales: { ...payload.locales, EN } };
              if (!slugEdited) {
                next.slug = normalizeSlug(EN.listTitle);
              }
              setPayload(next);
            }}
          />
          <LocaleFields
            label="Farsi"
            locale="FA"
            data={payload.locales.FA}
            onChange={(FA) => setPayload({ ...payload, locales: { ...payload.locales, FA } })}
          />
        </div>
      )}

      <button
        type="submit"
        className="self-start bg-orange px-6 py-3 font-mono text-xs uppercase tracking-widest text-background"
      >
        Publish course (EN + FA)
      </button>
    </form>
  );
}
