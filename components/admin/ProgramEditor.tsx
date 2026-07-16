"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import AdminLessonEditor from "@/components/admin/AdminLessonEditor";
import ProgramMultiSelect from "@/components/admin/ProgramMultiSelect";
import type {
  LessonType,
  MemberProgram,
  ProgramBonusLink,
  ProgramLesson,
  UsefulLink,
} from "@/lib/members/types";
import type { QuizQuestionPayload } from "@/lib/members/types";

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: "Video",
  text: "Text",
  quiz: "Quiz",
};

interface ProgramEditorProps {
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onStatus: (message: string) => void;
  mode?: "main" | "bonus";
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

const emptyProgram = (
  mode: "main" | "bonus"
): Omit<MemberProgram, "id" | "createdAt" | "updatedAt"> & { id?: string } => ({
  slug: "",
  titleEn: "",
  titleFa: "",
  descriptionEn: "",
  descriptionFa: "",
  title: "",
  description: "",
  coverImage: null,
  sortOrder: 0,
  status: "draft",
  usefulLinks: [],
  certificateEnabled: false,
  certificateTitleEn: null,
  certificateTitleFa: null,
  certificateHours: null,
  comingSoon: mode === "main",
  certificateOnly: false,
  programType: mode,
});

const LESSON_TYPE_OPTIONS: Array<{ type: LessonType; label: string; hint: string }> = [
  { type: "video", label: "Video lesson", hint: "Video player + materials below" },
  { type: "text", label: "Text lesson", hint: "Blog-style reading content" },
  { type: "quiz", label: "Quiz lesson", hint: "Questions with 100% pass required" },
];

export default function ProgramEditor({
  membersRequest,
  onStatus,
  mode = "main",
}: ProgramEditorProps) {
  const isBonus = mode === "bonus";
  const [programs, setPrograms] = useState<MemberProgram[]>([]);
  const [mainPrograms, setMainPrograms] = useState<MemberProgram[]>([]);
  const [bonusLinks, setBonusLinks] = useState<ProgramBonusLink[]>([]);
  const [view, setView] = useState<View>("list");
  const [program, setProgram] = useState(emptyProgram(mode));
  const [lessons, setLessons] = useState<ProgramLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const lessonsSectionRef = useRef<HTMLDivElement>(null);

  function collapseLessons() {
    setExpandedLessonId(null);
  }

  function openLessonEditor(lessonId: string) {
    setShowTypePicker(false);
    setExpandedLessonId(lessonId);
  }

  function handleAddLessonClick() {
    collapseLessons();
    setShowTypePicker(true);
    lessonsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetLessonUi() {
    setExpandedLessonId(null);
    setShowTypePicker(false);
  }

  const loadList = useCallback(async () => {
    const data = (await membersRequest("list-programs", { programType: mode })) as {
      programs: MemberProgram[];
    };
    setPrograms(data.programs ?? []);
  }, [membersRequest, mode]);

  const loadMainPrograms = useCallback(async () => {
    if (!isBonus) return;
    const data = (await membersRequest("list-programs", { programType: "main" })) as {
      programs: MemberProgram[];
    };
    setMainPrograms(data.programs ?? []);
  }, [isBonus, membersRequest]);

  useEffect(() => {
    loadList().catch((e) =>
      onStatus(e instanceof Error ? e.message : "Could not load programs")
    );
    loadMainPrograms().catch(() => undefined);
  }, [loadList, loadMainPrograms, onStatus]);

  const uploadSlug = program.slug || slugify(program.titleEn || program.titleFa) || "member-lesson";

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
        bonusLinks?: ProgramBonusLink[];
      };
      setProgram(data.program);
      setLessons(data.lessons ?? []);
      setBonusLinks(data.bonusLinks ?? []);
      resetLessonUi();
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
      const wasNew = !program.id;
      const saved = (await membersRequest("save-program", {
        program: {
          id: program.id,
          slug: program.slug || slugify(program.titleEn || program.titleFa),
          titleEn: program.titleEn,
          titleFa: program.titleFa,
          descriptionEn: program.descriptionEn,
          descriptionFa: program.descriptionFa,
          coverImage: program.coverImage,
          sortOrder: program.sortOrder,
          status: program.status,
          usefulLinks: program.usefulLinks,
          certificateEnabled: isBonus ? false : program.certificateEnabled,
          certificateTitleEn: isBonus ? null : program.certificateTitleEn,
          certificateTitleFa: isBonus ? null : program.certificateTitleFa,
          certificateHours: isBonus ? null : program.certificateHours,
          comingSoon: isBonus ? false : program.comingSoon,
          certificateOnly: isBonus ? false : program.certificateOnly,
          programType: mode,
        },
      })) as { program: MemberProgram };

      if (isBonus && saved.program.id) {
        await persistBonusLinks(saved.program.id, bonusLinks);
      }

      await loadList();
      if (isBonus && wasNew) {
        setProgram(saved.program);
        setView("edit");
        onStatus("Bonus program saved. Link it to main programs below.");
        return;
      }
      setView("list");
      setProgram(emptyProgram(mode));
      setLessons([]);
      setBonusLinks([]);
      resetLessonUi();
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
    collapseLessons();
    try {
      const saved = await saveLesson(
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
      if (saved) {
        setExpandedLessonId(saved.id);
        requestAnimationFrame(() => {
          document
            .getElementById(`lesson-${saved.id}`)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
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
    setExpandedLessonId((current) => (current === lessonId ? null : current));
    setShowTypePicker(false);
    onStatus("Lesson deleted.");
  }

  async function removeProgram(programId: string, title: string) {
    if (
      !confirm(
        `Delete "${title}" permanently?\n\nThis removes all lessons, enrollments, student progress, and certificates for this program. This cannot be undone.`
      )
    ) {
      return;
    }
    setLoading(true);
    onStatus("Deleting program…");
    try {
      await membersRequest("delete-program", { programId });
      await loadList();
      if (program.id === programId) {
        setProgram(emptyProgram(mode));
        setLessons([]);
        setBonusLinks([]);
        setView("list");
      }
      onStatus("Program deleted.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  function updateLink(index: number, patch: Partial<UsefulLink>) {
    setProgram((p) => {
      const links = [...p.usefulLinks];
      links[index] = { ...links[index], ...patch };
      return { ...p, usefulLinks: links };
    });
  }

  function updateBonusLinkMainPrograms(programIds: string[]) {
    setBonusLinks((current) => {
      const next = programIds.map((mainProgramId) => {
        const existing = current.find((link) => link.mainProgramId === mainProgramId);
        return (
          existing ?? {
            id: `draft-${mainProgramId}`,
            bonusProgramId: program.id ?? "",
            mainProgramId,
            accessEndsAt: null,
            createdAt: "",
          }
        );
      });
      return next;
    });
  }

  async function persistBonusLinks(
    bonusProgramId: string,
    links: ProgramBonusLink[]
  ): Promise<void> {
    const saved = (await membersRequest("save-bonus-links", {
      bonusProgramId,
      links: links.map((link) => ({
        mainProgramId: link.mainProgramId,
        accessEndsAt: link.accessEndsAt,
      })),
    })) as { bonusLinks?: ProgramBonusLink[] };
    setBonusLinks(saved.bonusLinks ?? links);
  }

  async function handleBonusLinkProgramsChange(programIds: string[]) {
    updateBonusLinkMainPrograms(programIds);
    if (!program.id) return;

    const bonusProgramId = program.id;
    const nextLinks: ProgramBonusLink[] = programIds.map((mainProgramId) => {
      const existing = bonusLinks.find((link) => link.mainProgramId === mainProgramId);
      return (
        existing ?? {
          id: `draft-${mainProgramId}`,
          bonusProgramId,
          mainProgramId,
          accessEndsAt: null,
          createdAt: "",
        }
      );
    });

    onStatus("Saving bonus links…");
    try {
      await persistBonusLinks(program.id, nextLinks);
      onStatus("Bonus links saved.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not save bonus links");
    }
  }

  async function handleBonusLinkExpiryChange(
    mainProgramId: string,
    accessEndsAt: string | null
  ) {
    const nextLinks = bonusLinks.map((link) =>
      link.mainProgramId === mainProgramId ? { ...link, accessEndsAt } : link
    );
    setBonusLinks(nextLinks);
    if (!program.id) return;

    onStatus("Saving bonus links…");
    try {
      await persistBonusLinks(program.id, nextLinks);
      onStatus("Bonus links saved.");
    } catch (err) {
      onStatus(err instanceof Error ? err.message : "Could not save bonus links");
    }
  }

  if (view === "list") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-dm text-sm text-cream/70">
            {isBonus
              ? "Bonus programs with supplemental videos and files. Link them to main programs; students get access automatically when enrolled."
              : "Member programs for enrolled students (separate from public marketing courses)."}
          </p>
          <button
            type="button"
            onClick={() => {
              setProgram(emptyProgram(mode));
              setLessons([]);
              setBonusLinks([]);
              resetLessonUi();
              setView("edit");
            }}
            className="border border-orange px-4 py-2 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
          >
            {isBonus ? "New bonus program" : "New program"}
          </button>
        </div>
        {programs.length === 0 ? (
          <div className="border border-surface bg-surface/20 p-8 font-dm text-cream/70">
            {isBonus ? "No bonus programs yet." : "No member programs yet."}
          </div>
        ) : (
          <ul className="divide-y divide-surface border border-surface">
            {programs.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-surface/30"
              >
                <div>
                  <p className="font-dm text-cream">
                    {p.titleEn || p.titleFa || p.title}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">
                    {p.slug} · {p.status}
                    {p.comingSoon ? " · coming soon" : ""}
                    {p.certificateOnly ? " · certificate only" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => openProgram(p.id)}
                    className="border border-surface px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-cream hover:border-orange hover:text-orange"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => removeProgram(p.id, p.titleEn || p.titleFa || p.title)}
                    className="border border-red-500/40 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-red-300 hover:border-red-400 hover:text-red-200"
                  >
                    Delete
                  </button>
                </div>
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
          resetLessonUi();
          setView("list");
          loadList();
        }}
        className="self-start font-mono text-xs uppercase tracking-widest text-orange hover:text-cream"
      >
        ← Back to {isBonus ? "bonus programs" : "programs"}
      </button>

      <form
        onSubmit={handleSaveProgram}
        className="grid gap-4 border border-surface bg-surface/20 p-5 lg:grid-cols-2"
      >
        <Field label="Program title (English)" className="lg:col-span-2">
          <input
            value={program.titleEn}
            onChange={(e) => setProgram((p) => ({ ...p, titleEn: e.target.value }))}
            className="form-field"
            placeholder="e.g. From Prompt to Website"
            required
          />
        </Field>

        <Field label="Program title (Farsi)" className="lg:col-span-2">
          <input
            value={program.titleFa}
            onChange={(e) => setProgram((p) => ({ ...p, titleFa: e.target.value }))}
            className="form-field"
            placeholder="مثلاً از پرامپت تا وب‌سایت"
            dir="rtl"
          />
        </Field>

        <Field label="URL slug">
          <input
            value={program.slug}
            onChange={(e) => setProgram((p) => ({ ...p, slug: e.target.value }))}
            className="form-field"
            placeholder={slugify(program.titleEn || program.titleFa) || "program-slug"}
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

        {!isBonus && (
        <div className="lg:col-span-2 rounded border border-surface/80 bg-surface/10 p-4">
          <label className="flex items-start gap-3 font-dm text-sm text-cream">
            <input
              type="checkbox"
              checked={program.comingSoon}
              disabled={program.certificateOnly}
              onChange={(e) =>
                setProgram((p) => ({ ...p, comingSoon: e.target.checked }))
              }
              className="mt-1"
            />
            <span>
              <span className="font-semibold text-orange">Coming soon</span>
              <span className="mt-1 block text-cream/65">
                {program.certificateOnly
                  ? "Not used for certificate-only programs."
                  : "Enrolled students can see this program on their dashboard, but all lessons stay locked until you turn this off and upload materials."}
              </span>
            </span>
          </label>
        </div>
        )}

        {isBonus && program.id && (
          <div className="lg:col-span-2 flex flex-col gap-4 rounded border border-surface/80 bg-surface/10 p-4">
            <div>
              <p className="font-dm text-sm font-semibold text-cream">Linked main programs</p>
              <p className="mt-1 font-dm text-xs text-cream/60">
                Students enrolled in any selected program can access this bonus content.
                Set an optional expiry per program, or leave blank for unlimited access.
              </p>
            </div>
            <ProgramMultiSelect
              programs={mainPrograms}
              value={bonusLinks.map((link) => link.mainProgramId)}
              onChange={handleBonusLinkProgramsChange}
            />
            {bonusLinks.length > 0 && (
              <ul className="flex flex-col gap-3">
                {bonusLinks.map((link) => {
                  const mainProgram = mainPrograms.find((item) => item.id === link.mainProgramId);
                  const title =
                    mainProgram?.titleEn || mainProgram?.titleFa || mainProgram?.title || link.mainProgramId;
                  return (
                    <li
                      key={link.mainProgramId}
                      className="grid gap-2 rounded border border-surface/80 bg-background/20 p-3 md:grid-cols-[1fr_auto]"
                    >
                      <span className="font-dm text-sm text-cream">{title}</span>
                      <label className="flex flex-col gap-1">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                          Access ends (optional)
                        </span>
                        <input
                          type="date"
                          value={
                            link.accessEndsAt
                              ? link.accessEndsAt.slice(0, 10)
                              : ""
                          }
                          onChange={(e) =>
                            void handleBonusLinkExpiryChange(
                              link.mainProgramId,
                              e.target.value ? `${e.target.value}T23:59:59.999Z` : null
                            )
                          }
                          className="form-field max-w-xs"
                        />
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {isBonus && !program.id && (
          <p className="lg:col-span-2 rounded border border-orange/30 bg-orange/5 p-4 font-dm text-sm text-cream/70">
            Save the bonus program first, then you can link it to main programs.
          </p>
        )}

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

        <Field label="Program description (English)" className="lg:col-span-2">
          <textarea
            value={program.descriptionEn}
            onChange={(e) =>
              setProgram((p) => ({ ...p, descriptionEn: e.target.value }))
            }
            className="form-field min-h-24"
            placeholder="Short summary shown on the student dashboard"
          />
        </Field>

        <Field label="Program description (Farsi)" className="lg:col-span-2">
          <textarea
            value={program.descriptionFa}
            onChange={(e) =>
              setProgram((p) => ({ ...p, descriptionFa: e.target.value }))
            }
            className="form-field min-h-24"
            placeholder="خلاصه کوتاه برای داشبورد دانشجو"
            dir="rtl"
          />
        </Field>

        {!isBonus && (
        <div className="lg:col-span-2 flex flex-col gap-4 rounded border border-surface/80 bg-surface/10 p-4">
          <label className="flex items-center gap-3 font-dm text-sm text-cream">
            <input
              type="checkbox"
              checked={program.certificateEnabled}
              onChange={(e) =>
                setProgram((p) => ({
                  ...p,
                  certificateEnabled: e.target.checked,
                  certificateOnly: e.target.checked ? p.certificateOnly : false,
                }))
              }
              className="size-4 accent-orange"
            />
            Issue completion certificate for this program
          </label>
          {program.certificateEnabled && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-start gap-3 font-dm text-sm text-cream md:col-span-2">
                <input
                  type="checkbox"
                  checked={program.certificateOnly}
                  onChange={(e) =>
                    setProgram((p) => ({
                      ...p,
                      certificateOnly: e.target.checked,
                      comingSoon: e.target.checked ? false : p.comingSoon,
                    }))
                  }
                  className="mt-0.5 size-4 shrink-0 accent-orange"
                />
                <span>
                  <span className="font-medium">Certificate-only program</span>
                  <span className="mt-1 block text-cream/55">
                    For private 1:1 courses without lessons. Students see certificate status
                    instead of lesson progress. You issue the certificate manually from the
                    student profile.
                  </span>
                </span>
              </label>
              <Field label="Certificate title (English)">
                <input
                  value={program.certificateTitleEn ?? ""}
                  onChange={(e) =>
                    setProgram((p) => ({
                      ...p,
                      certificateTitleEn: e.target.value || null,
                    }))
                  }
                  className="form-field"
                  placeholder={program.titleEn || program.titleFa || "Same as program title"}
                />
              </Field>
              <Field label="Certificate title (Farsi)">
                <input
                  value={program.certificateTitleFa ?? ""}
                  onChange={(e) =>
                    setProgram((p) => ({
                      ...p,
                      certificateTitleFa: e.target.value || null,
                    }))
                  }
                  className="form-field"
                  placeholder={program.titleEn || program.titleFa || "Same as program title"}
                />
              </Field>
              <Field label="Hours override (optional)" className="md:col-span-2">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={program.certificateHours ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    setProgram((p) => ({
                      ...p,
                      certificateHours: raw ? Number(raw) : null,
                    }));
                  }}
                  className="form-field max-w-xs"
                  placeholder={
                    program.certificateOnly
                      ? "e.g. 8 (recommended for certificate-only)"
                      : "Auto from lesson durations"
                  }
                />
              </Field>
            </div>
          )}
        </div>
        )}

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

        {program.id ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => removeProgram(program.id!, program.titleEn || program.titleFa || program.title)}
            className="lg:col-span-2 border border-red-500/40 px-5 py-3 font-mono text-xs uppercase tracking-widest text-red-300 hover:border-red-400 hover:text-red-200"
          >
            Delete program
          </button>
        ) : null}
      </form>

      {program.id && (
        <div
          ref={lessonsSectionRef}
          className="flex flex-col gap-0 border border-surface bg-surface/10"
        >
          <div className="sticky top-20 z-10 border-b border-surface bg-background/95 px-5 py-4 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-dm text-xl text-cream">Lessons</h2>
                <p className="mt-1 font-dm text-xs text-cream/55">
                  {program.certificateOnly
                    ? "Certificate-only: lessons are optional. Leave empty for private 1:1 programs."
                    : lessons.length === 0
                      ? "No lessons yet. Add your first lesson below."
                      : `${lessons.length} lesson${lessons.length === 1 ? "" : "s"} · click a row to edit`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddLessonClick}
                className="border border-orange px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
              >
                Add lesson
              </button>
            </div>

            {showTypePicker && (
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {LESSON_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => void createLesson(option.type)}
                    className="rounded-lg border border-orange/30 bg-orange/5 p-3 text-left transition-colors hover:border-orange/60 hover:bg-orange/10"
                  >
                    <p className="font-dm text-sm font-semibold text-cream">{option.label}</p>
                    <p className="mt-1 font-dm text-xs text-cream/55">{option.hint}</p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowTypePicker(false)}
                  className="sm:col-span-3 self-start font-mono text-[10px] uppercase tracking-widest text-cream/50 hover:text-orange"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {lessons.length === 0 ? (
            <p className="p-5 font-dm text-sm text-cream/60">
              Lessons appear here as compact rows. Only one editor opens at a time.
            </p>
          ) : (
            <ul className="divide-y divide-surface">
              {lessons.map((lesson, index) => {
                const isExpanded = expandedLessonId === lesson.id;
                const title = lesson.titleEn || lesson.titleFa || "Untitled lesson";

                return (
                  <li
                    key={lesson.id}
                    id={`lesson-${lesson.id}`}
                    className={
                      isExpanded
                        ? "bg-background/30"
                        : "bg-background/10 transition-colors hover:bg-background/20"
                    }
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          isExpanded ? collapseLessons() : openLessonEditor(lesson.id)
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="font-dm text-cream">
                          <span className="me-2 font-mono text-xs text-orange">#{index + 1}</span>
                          {title}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-cream/45">
                          {LESSON_TYPE_LABELS[lesson.lessonType]}
                          {lesson.publishedAt ? " · Published" : " · Draft"}
                          {lesson.durationMinutes
                            ? ` · ${lesson.durationMinutes} min`
                            : ""}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          isExpanded ? collapseLessons() : openLessonEditor(lesson.id)
                        }
                        className={`shrink-0 border px-3 py-1.5 font-mono text-xs uppercase tracking-widest ${
                          isExpanded
                            ? "border-orange/60 text-orange"
                            : "border-surface text-cream hover:border-orange hover:text-orange"
                        }`}
                      >
                        {isExpanded ? "Close" : "Edit"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-surface px-5 pb-5">
                        <AdminLessonEditor
                          lesson={lesson}
                          index={index}
                          total={lessons.length}
                          embedded
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
                          onCollapse={collapseLessons}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
