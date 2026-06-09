"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { MemberProgram, ProgramLesson, UsefulLink } from "@/lib/members/types";

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

export default function ProgramEditor({ membersRequest, onStatus }: ProgramEditorProps) {
  const [programs, setPrograms] = useState<MemberProgram[]>([]);
  const [view, setView] = useState<View>("list");
  const [program, setProgram] = useState(emptyProgram());
  const [lessons, setLessons] = useState<ProgramLesson[]>([]);
  const [loading, setLoading] = useState(false);

  const loadList = useCallback(async () => {
    const data = (await membersRequest("list-programs")) as { programs: MemberProgram[] };
    setPrograms(data.programs ?? []);
  }, [membersRequest]);

  useEffect(() => {
    loadList().catch((e) =>
      onStatus(e instanceof Error ? e.message : "Could not load programs")
    );
  }, [loadList, onStatus]);

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
      const data = (await membersRequest("save-program", {
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
      })) as { program: MemberProgram };
      setProgram(data.program);
      await loadList();
      onStatus("Program saved.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function saveLesson(lesson: Partial<ProgramLesson> & { published: boolean }) {
    if (!program.id) {
      onStatus("Save the program first.");
      return;
    }
    onStatus("Saving lesson…");
    try {
      const data = (await membersRequest("save-lesson", {
        lesson: {
          id: lesson.id,
          programId: program.id,
          title: lesson.title ?? "",
          description: lesson.description ?? "",
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
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Lesson save failed");
    }
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
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-surface/30">
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

      <form onSubmit={handleSaveProgram} className="grid gap-4 border border-surface bg-surface/20 p-5 lg:grid-cols-2">
        <input
          value={program.title}
          onChange={(e) => setProgram((p) => ({ ...p, title: e.target.value }))}
          className="form-field lg:col-span-2"
          placeholder="Program title"
          required
        />
        <input
          value={program.slug}
          onChange={(e) => setProgram((p) => ({ ...p, slug: e.target.value }))}
          className="form-field"
          placeholder={`Slug (default: ${slugify(program.title) || "program-slug"})`}
        />
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
        <input
          type="number"
          value={program.sortOrder}
          onChange={(e) =>
            setProgram((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))
          }
          className="form-field"
          placeholder="Sort order"
        />
        <input
          value={program.coverImage ?? ""}
          onChange={(e) =>
            setProgram((p) => ({ ...p, coverImage: e.target.value || null }))
          }
          className="form-field"
          placeholder="Cover image URL (optional)"
        />
        <textarea
          value={program.description}
          onChange={(e) => setProgram((p) => ({ ...p, description: e.target.value }))}
          className="form-field min-h-24 lg:col-span-2"
          placeholder="Program description"
        />

        <div className="lg:col-span-2 flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-orange">Useful links</p>
          {program.usefulLinks.map((link, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <input
                value={link.label}
                onChange={(e) => updateLink(i, { label: e.target.value })}
                className="form-field flex-1 min-w-[120px]"
                placeholder="Label"
              />
              <input
                value={link.url}
                onChange={(e) => updateLink(i, { url: e.target.value })}
                className="form-field flex-[2] min-w-[200px]"
                placeholder="URL"
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
              onClick={() =>
                saveLesson({
                  title: "New lesson",
                  description: "",
                  sortOrder: lessons.length,
                  published: false,
                })
              }
              className="border border-orange px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
            >
              Add lesson
            </button>
          </div>

          {lessons.length === 0 ? (
            <p className="font-dm text-sm text-cream/60">No lessons yet.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {lessons.map((lesson, index) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  total={lessons.length}
                  onSave={(patch) => saveLesson({ ...lesson, ...patch, published: patch.published ?? !!lesson.publishedAt })}
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

function LessonRow({
  lesson,
  index,
  total,
  onSave,
  onMove,
  onDelete,
}: {
  lesson: ProgramLesson;
  index: number;
  total: number;
  onSave: (patch: Partial<ProgramLesson> & { published?: boolean }) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl ?? "");
  const [published, setPublished] = useState(!!lesson.publishedAt);

  useEffect(() => {
    setTitle(lesson.title);
    setDescription(lesson.description);
    setVideoUrl(lesson.videoUrl ?? "");
    setPublished(!!lesson.publishedAt);
  }, [lesson]);

  return (
    <li className="border border-surface bg-background/30 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-orange">#{index + 1}</span>
        <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="font-mono text-xs text-cream/50 hover:text-orange disabled:opacity-30">↑</button>
        <button type="button" disabled={index >= total - 1} onClick={() => onMove(1)} className="font-mono text-xs text-cream/50 hover:text-orange disabled:opacity-30">↓</button>
        <label className="ms-auto flex items-center gap-2 font-mono text-xs text-cream/70">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
      </div>
      <div className="grid gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-field" placeholder="Lesson title" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-field min-h-20" placeholder="Description" />
        <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="form-field font-mono text-xs" placeholder="Video URL (YouTube, Vimeo, or direct link)" />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() =>
            onSave({ title, description, videoUrl: videoUrl || null, published })
          }
          className="border border-orange px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
        >
          Save lesson
        </button>
        <button type="button" onClick={onDelete} className="border border-surface px-3 py-1.5 font-mono text-xs text-cream/50 hover:text-orange">
          Delete
        </button>
      </div>
    </li>
  );
}
