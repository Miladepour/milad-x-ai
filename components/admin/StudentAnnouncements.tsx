"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import ProgramMultiSelect from "@/components/admin/ProgramMultiSelect";
import StudentSearchSelect from "@/components/admin/StudentSearchSelect";
import type {
  MemberProgram,
  StudentAnnouncement,
  StudentAnnouncementAudienceType,
  StudentProfile,
} from "@/lib/members/types";

interface StudentAnnouncementsProps {
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onStatus: (message: string, variant?: "success" | "error" | "info") => void;
  programs: MemberProgram[];
  students: StudentProfile[];
}

const AUDIENCE_OPTIONS: { value: StudentAnnouncementAudienceType; label: string }[] = [
  { value: "all", label: "All students" },
  { value: "student", label: "One student" },
  { value: "programs", label: "Program enrollment" },
];

function formatAudienceLabel(
  item: StudentAnnouncement,
  students: StudentProfile[],
  programs: MemberProgram[]
): string {
  if (item.audienceType === "student") {
    const student = students.find((profile) => profile.id === item.studentId);
    return student
      ? `One student · ${student.fullName || student.email}`
      : "One student";
  }
  if (item.audienceType === "programs") {
    const titles = item.programIds
      .map((id) => programs.find((program) => program.id === id)?.title)
      .filter(Boolean);
    if (titles.length === 1) return `Program · ${titles[0]}`;
    if (titles.length > 1) return `Programs · ${titles.join(", ")}`;
    return `${item.programIds.length} program${item.programIds.length === 1 ? "" : "s"}`;
  }
  return "All students";
}

export default function StudentAnnouncements({
  membersRequest,
  onStatus,
  programs,
  students,
}: StudentAnnouncementsProps) {
  const [items, setItems] = useState<StudentAnnouncement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    body: "",
    audienceType: "all" as StudentAnnouncementAudienceType,
    studentId: "",
    programIds: [] as string[],
    linkUrl: "",
    linkLabel: "",
    published: true,
    expiresAt: "",
  });

  const load = useCallback(async () => {
    const data = (await membersRequest("list-announcements")) as {
      announcements: StudentAnnouncement[];
    };
    setItems(data.announcements ?? []);
  }, [membersRequest]);

  useEffect(() => {
    void load();
  }, [load]);

  const canSubmit = useMemo(() => {
    if (!form.title.trim()) return false;
    if (form.audienceType === "student" && !form.studentId) return false;
    if (form.audienceType === "programs" && form.programIds.length === 0) return false;
    return true;
  }, [form]);

  function resetForm() {
    setEditingId(null);
    setForm({
      title: "",
      body: "",
      audienceType: "all",
      studentId: "",
      programIds: [],
      linkUrl: "",
      linkLabel: "",
      published: true,
      expiresAt: "",
    });
  }

  function startEdit(item: StudentAnnouncement) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      body: item.body,
      audienceType: item.audienceType,
      studentId: item.studentId ?? "",
      programIds: item.programIds,
      linkUrl: item.linkUrl ?? "",
      linkLabel: item.linkLabel ?? "",
      published: !!item.publishedAt,
      expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : "",
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      onStatus("Complete the title and audience before publishing.", "error");
      return;
    }

    await membersRequest("save-announcement", {
      id: editingId ?? undefined,
      title: form.title,
      body: form.body,
      audienceType: form.audienceType,
      studentId: form.audienceType === "student" ? form.studentId : null,
      programIds: form.audienceType === "programs" ? form.programIds : [],
      linkUrl: form.linkUrl.trim() || null,
      linkLabel: form.linkLabel.trim() || null,
      published: form.published,
      expiresAt: form.expiresAt
        ? new Date(`${form.expiresAt}T23:59:59`).toISOString()
        : null,
    });

    onStatus(
      editingId ? "Announcement updated." : "Announcement published.",
      "success"
    );
    resetForm();
    await load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this announcement?")) return;
    await membersRequest("delete-announcement", { id });
    onStatus("Announcement deleted.", "success");
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="student-section-title">Publish to student dashboard</p>
        <p className="mt-2 font-dm text-sm text-cream/60">
          Send announcements to all students, one student, or students enrolled in selected
          programs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
            Title
          </span>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="form-field"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
            Message
          </span>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            rows={4}
            className="form-field resize-y"
          />
        </label>

        <fieldset className="grid gap-3 rounded-2xl border border-white/[0.08] p-4">
          <legend className="px-1 font-mono text-[10px] uppercase tracking-widest text-orange">
            Audience
          </legend>
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    audienceType: option.value,
                    studentId: option.value === "student" ? f.studentId : "",
                    programIds: option.value === "programs" ? f.programIds : [],
                  }))
                }
                className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  form.audienceType === option.value
                    ? "bg-orange text-background"
                    : "border border-white/[0.1] text-cream/70 hover:border-orange hover:text-orange"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {form.audienceType === "student" && (
            <StudentSearchSelect
              students={students}
              value={form.studentId}
              onChange={(studentId) => setForm((f) => ({ ...f, studentId }))}
            />
          )}

          {form.audienceType === "programs" && (
            <ProgramMultiSelect
              programs={programs}
              value={form.programIds}
              onChange={(programIds) => setForm((f) => ({ ...f, programIds }))}
            />
          )}
        </fieldset>

        <fieldset className="grid gap-3 rounded-2xl border border-white/[0.08] p-4 md:grid-cols-2">
          <legend className="px-1 font-mono text-[10px] uppercase tracking-widest text-orange md:col-span-2">
            Learn more button (optional)
          </legend>
          <label className="grid gap-1 md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              Link URL
            </span>
            <input
              value={form.linkUrl}
              onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
              className="form-field"
              placeholder="https://example.com or /courses/my-course"
            />
          </label>
          <label className="grid gap-1 md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
              Button label
            </span>
            <input
              value={form.linkLabel}
              onChange={(e) => setForm((f) => ({ ...f, linkLabel: e.target.value }))}
              className="form-field max-w-md"
              placeholder="Learn more"
              disabled={!form.linkUrl.trim()}
            />
            <span className="font-dm text-xs text-cream/50">
              Leave blank to use the default “Learn more” label on the student dashboard.
            </span>
          </label>
        </fieldset>

        <label className="grid max-w-xs gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
            Expires (optional)
          </span>
          <input
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
            className="form-field"
          />
        </label>

        <label className="flex items-center gap-2 font-dm text-sm text-cream">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
          />
          Published (visible to students)
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="bg-orange px-4 py-2 font-mono text-xs uppercase tracking-widest text-background hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editingId ? "Update announcement" : "Publish announcement"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-white/[0.1] px-4 py-2 font-mono text-xs uppercase tracking-widest text-cream hover:border-orange"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {items.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="student-section-title">Published & draft</p>
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="student-glass-pill flex flex-wrap items-start justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="font-dm font-medium text-cream">{item.title}</p>
                  <p className="mt-1 line-clamp-2 font-dm text-sm text-cream/60">{item.body}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-cream/40">
                    {formatAudienceLabel(item, students, programs)} ·{" "}
                    {item.linkUrl ? "Has link · " : ""}
                    {item.publishedAt ? "Published" : "Draft"}
                    {item.expiresAt
                      ? ` · Expires ${new Date(item.expiresAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="rounded-full border border-white/[0.1] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cream hover:border-orange"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id)}
                    className="rounded-full border border-red-400/30 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-red-300 hover:border-red-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
