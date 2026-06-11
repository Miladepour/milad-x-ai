"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AdminLessonEditor from "@/components/admin/AdminLessonEditor";
import type { LessonType, MemberProgram, ProgramLesson, UsefulLink } from "@/lib/members/types";
import type { QuizQuestionPayload } from "@/lib/members/types";

interface ProgramEditorProps {
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onStatus: (message: string) => void;
}

type View = "list" | "edit";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
        {label}
      </span>
      {children}
    </label>
  );
}

const emptyProgram = (): Omit<MemberProgram, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
} => ({
  slug: "",
  title: "",
  description: "",
  coverImage: null,
  sortOrder: 0,
  status: "draft",
  usefulLinks: [],
});

const LESSON_TYPE_OPTIONS: Array<{ type: LessonType; label: string; hint: string }> = [
  { type: "video", label: "Video lesson", hint: "Video player + materials below" },
  { type: "text", label: "Text lesson", hint: "Blog-style reading content" },
  { type: "quiz", label: "Quiz lesson", hint: "Questions with 100% pass required" },
];

export default function ProgramEditor({ membersRequest, onStatus }: ProgramEditorProps) {
  const [programs, setPrograms] = useState<MemberProgram[]>([]);
  const [view, setView] = useState<View>("list");
  const [program, setProgram] = useState(emptyProgram());
  const [lessons, setLessons] = useState<ProgramLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const loadList = useCallback(async () => {
    const data = (await membersRequest("list-programs")) as { programs: MemberProgram[] };
    setPrograms(data.programs ?? []);
  }, [membersRequest]);

  useEffect(() => {
    loadList().catch((e) =>
      onStatus(e instanceof Error ? e.message : "Could not load programs")
    );
  }, [loadList, onStatus]);

  const uploadSlug = program.slug || slugify(program.title) || "member-lesson";

  async function uploadLessonImage(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("slug", uploadSlug);
    form.append("bucket", "blog-images");
    form.append("kind", "inline");
    const res = await fetch("/api/admin-upload", { method: "POST", body: form });
    const json = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !json.url) throw new Error(json.error || "Upload failed");
    return json.url;
  }

  async function openProgram(idOrSlug: string) {
    setLoading(true);
    onStatus("Loading program…");
    try {
      const data = (await membersRequest("get-program", { id: idOrSlug })) as {
        program: MemberProgram;
        lessons: ProgramLesson[];
      };
      setProgram(data.program);
      setLessons(data.lessons ?? []);
      setView("edit");
      onStatus("");
    } catch (e) {
      onStatus(e instanceof Error ? e.message : "Could not load program");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProgram(e: FormEvent) {
    e.preventDefault();
    onStatus("Saving program…");
    try {
      await membersRequest("save-program", {
        program: {
          id: program.id,
          slug: program.slug || slugify(program.title),
          title: program.title,
          description: program.description,
          coverImage: program.coverImage,
          sortOrder: program.sortOrder,
          status: program.status,
          usefulLinks: program.usefulLinks,
        },
      });
      await loadList();
      setView("list");
      setProgram(emptyProgram());
      setLessons([]);
      onStatus("Program saved.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function saveLesson(
    lesson: Partial<ProgramLesson> & { published: boolean },
    lessonType?: LessonType
  ) {
    if (!program.id) {
      onStatus("Save the program first.");
      return null;
    }
    onStatus("Saving lesson…");
    const data = (await membersRequest("save-lesson", {
      lesson: {
        id: lesson.id,
        programId: program.id,
        lessonType: lessonType ?? lesson.lessonType ?? "video",
        titleEn: lesson.titleEn ?? lesson.title ?? "New lesson",
        titleFa: lesson.titleFa ?? lesson.title ?? "",
        bodyEn: lesson.bodyEn ?? lesson.description ?? "",
        bodyFa: lesson.bodyFa ?? lesson.description ?? "",
        videoUrl: lesson.videoUrl,
        sortOrder: lesson.sortOrder ?? lessons.length,
        durationMinutes: lesson.durationMinutes,
        published: lesson.published,
      },
    })) as { lesson: ProgramLesson };

    setLessons((prev) => {
      const idx = prev.findIndex((l) => l.id === data.lesson.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = data.lesson;
        return next;
      }
      return [...prev, data.lesson];
    });
    onStatus("Lesson saved.");
    return data.lesson;
  }

  async function createLesson(type: LessonType) {
    setShowTypePicker(false);
    try {
      await saveLesson(
        {
          titleEn: type === "quiz" ? "New quiz" : "New lesson",
          titleFa: type === "quiz" ? "آزمون جدید" : "درس جدید",
          bodyEn: "",
          bodyFa: "",
          sortOrder: lessons.length,
          published: false,
        },
        type
      );
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Lesson save failed");
    }
  }

  async function loadQuizQuestions(lessonId: string): Promise<QuizQuestionPayload[]> {
    const data = (await membersRequest("get-lesson-quiz", { lessonId })) as {
      questions: Array<{
        promptEn: string;
        promptFa: string;
        explanationEn: string;
        explanationFa: string;
        sortOrder: number;
        options: Array<{
          labelEn: string;
          labelFa: string;
          isCorrect: boolean;
          sortOrder: number;
        }>;
      }>;
    };
    return (data.questions ?? []).map((question) => ({
      promptEn: question.promptEn,
      promptFa: question.promptFa,
      explanationEn: question.explanationEn,
      explanationFa: question.explanationFa,
      sortOrder: question.sortOrder,
      options: question.options.map((option) => ({
        labelEn: option.labelEn,
        labelFa: option.labelFa,
        isCorrect: option.isCorrect,
        sortOrder: option.sortOrder,
      })),
    }));
  }

  async function saveQuizQuestions(lessonId: string, questions: QuizQuestionPayload[]) {
    await membersRequest("save-lesson-quiz", { lessonId, questions });
    onStatus("Quiz saved.");
  }

  async function moveLesson(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= lessons.length || !program.id) return;
    const reordered = [...lessons];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);
    setLessons(reordered);
    await membersRequest("reorder-lessons", {
      programId: program.id,
      lessonIds: reordered.map((l) => l.id),
    });
  }

  async function removeLesson(lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    await membersRequest("delete-lesson", { lessonId });
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    onStatus("Lesson deleted.");
  }

  function updateLink(index: number, patch: Partial<UsefulLink>) {
    setProgram((p) => {
      const links = [...p.usefulLinks];
      links[index] = { ...links[index], ...patch };
      return { ...p, usefulLinks: links };
    });
  }

  if (view === "list") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-dm text-sm text-cream/70">
            Member programs for enrolled students (separate from public marketing courses).
          </p>
          <button
            type="button"
            onClick={() => {
              setProgram(emptyProgram());
              setLessons([]);
              setView("edit");
            }}
            className="border border-orange px-4 py-2 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
          >
            New program
          </button>
        </div>
        {programs.length === 0 ? (
          <div className="border border-surface bg-surface/20 p-8 font-dm text-cream/70">
            No member programs yet.
          </div>
        ) : (
          <ul className="divide-y divide-surface border border-surface">
            {programs.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-surface/30"
              >
                <div>
                  <p className="font-dm text-cream">{p.title}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
                    {p.slug} · {p.status}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => openProgram(p.id)}
                  className="border border-surface px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-cream hover:border-orange hover:text-orange"
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
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => {
          setView("list");
          loadList();
        }}
        className="self-start font-mono text-xs uppercase tracking-widest text-orange hover:text-cream"
      >
        ← Back to programs
      </button>

      <form
        onSubmit={handleSaveProgram}
        className="grid gap-4 border border-surface bg-surface/20 p-5 lg:grid-cols-2"
      >
        <Field label="Program title" className="lg:col-span-2">
          <input
            value={program.title}
            onChange={(e) => setProgram((p) => ({ ...p, title: e.target.value }))}
            className="form-field"
            placeholder="e.g. Claude AI Webinar"
            required
          />
        </Field>

        <Field label="URL slug">
          <input
            value={program.slug}
            onChange={(e) => setProgram((p) => ({ ...p, slug: e.target.value }))}
            className="form-field"
            placeholder={slugify(program.title) || "program-slug"}
          />
        </Field>

        <Field label="Status">
          <select
            value={program.status}
            onChange={(e) =>
              setProgram((p) => ({
                ...p,
                status: e.target.value === "published" ? "published" : "draft",
              }))
            }
            className="form-field"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>

        <Field label="Sort order">
          <input
            type="number"
            value={program.sortOrder}
            onChange={(e) =>
              setProgram((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))
            }
            className="form-field"
            placeholder="0"
          />
        </Field>

        <Field label="Cover image URL (optional)">
          <input
            value={program.coverImage ?? ""}
            onChange={(e) =>
              setProgram((p) => ({ ...p, coverImage: e.target.value || null }))
            }
            className="form-field"
            placeholder="https://…"
          />
        </Field>

        <Field label="Program description" className="lg:col-span-2">
          <textarea
            value={program.description}
            onChange={(e) => setProgram((p) => ({ ...p, description: e.target.value }))}
            className="form-field min-h-24"
            placeholder="Short summary shown on the student dashboard"
          />
        </Field>

        <div className="lg:col-span-2 flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
            Useful links
          </span>
          {program.usefulLinks.map((link, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
              <input
                value={link.label}
                onChange={(e) => updateLink(i, { label: e.target.value })}
                className="form-field"
                placeholder="Link label"
                aria-label={`Link ${i + 1} label`}
              />
              <input
                value={link.url}
                onChange={(e) => updateLink(i, { url: e.target.value })}
                className="form-field"
                placeholder="https://…"
                aria-label={`Link ${i + 1} URL`}
              />
              <button
                type="button"
                onClick={() =>
                  setProgram((p) => ({
                    ...p,
                    usefulLinks: p.usefulLinks.filter((_, j) => j !== i),
                  }))
                }
                className="border border-surface px-3 font-mono text-xs text-cream/60 hover:text-orange"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setProgram((p) => ({
                ...p,
                usefulLinks: [
                  ...p.usefulLinks,
                  { label: "", url: "", sortOrder: p.usefulLinks.length },
                ],
              }))
            }
            className="self-start border border-surface px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-cream hover:border-orange"
          >
            Add link
          </button>
        </div>

        <button
          type="submit"
          className="lg:col-span-2 bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background hover:bg-cream"
        >
          Save program
        </button>
      </form>

      {program.id && (
        <div className="flex flex-col gap-4 border border-surface bg-surface/10 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-dm text-xl text-cream">Lessons</h2>
            <button
              type="button"
              onClick={() => setShowTypePicker(true)}
              className="border border-orange px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
            >
              Add lesson
            </button>
          </div>

          {showTypePicker && (
            <div className="grid gap-3 border border-orange/30 bg-orange/5 p-4 md:grid-cols-3">
              {LESSON_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => void createLesson(option.type)}
                  className="rounded-xl border border-white/[0.08] bg-background/40 p-4 text-left transition-colors hover:border-orange/50 hover:bg-orange/10"
                >
                  <p className="font-dm text-sm font-semibold text-cream">{option.label}</p>
                  <p className="mt-1 font-dm text-xs text-cream/55">{option.hint}</p>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowTypePicker(false)}
                className="md:col-span-3 self-start font-mono text-[10px] uppercase tracking-widest text-cream/50 hover:text-orange"
              >
                Cancel
              </button>
            </div>
          )}

          {lessons.length === 0 ? (
            <p className="font-dm text-sm text-cream/60">No lessons yet.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {lessons.map((lesson, index) => (
                <AdminLessonEditor
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  total={lessons.length}
                  onImageUpload={uploadLessonImage}
                  onSave={(patch) =>
                    saveLesson({
                      ...lesson,
                      ...patch,
                      published: patch.published ?? !!lesson.publishedAt,
                    }).then(() => undefined)
                  }
                  onSaveQuiz={(questions) => saveQuizQuestions(lesson.id, questions)}
                  onLoadQuiz={() => loadQuizQuestions(lesson.id)}
                  onMove={(dir) => moveLesson(index, dir)}
                  onDelete={() => removeLesson(lesson.id)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
