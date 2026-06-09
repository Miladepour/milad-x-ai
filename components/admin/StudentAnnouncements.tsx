"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type {
  AnnouncementLocale,
  StudentAnnouncement,
} from "@/lib/members/types";

interface StudentAnnouncementsProps {
  membersRequest: (action: string, payload?: Record<string, unknown>) => Promise<unknown>;
  onStatus: (message: string) => void;
}

const LOCALE_OPTIONS: { value: AnnouncementLocale; label: string }[] = [
  { value: "ALL", label: "All students" },
  { value: "EN", label: "English only" },
  { value: "FA", label: "Farsi only" },
];

export default function StudentAnnouncements({
  membersRequest,
  onStatus,
}: StudentAnnouncementsProps) {
  const [items, setItems] = useState<StudentAnnouncement[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    body: "",
    locale: "ALL" as AnnouncementLocale,
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

  function resetForm() {
    setEditingId(null);
    setForm({
      title: "",
      body: "",
      locale: "ALL",
      published: true,
      expiresAt: "",
    });
  }

  function startEdit(item: StudentAnnouncement) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      body: item.body,
      locale: item.locale,
      published: !!item.publishedAt,
      expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : "",
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      onStatus("Announcement title is required.");
      return;
    }

    await membersRequest("save-announcement", {
      id: editingId ?? undefined,
      title: form.title,
      body: form.body,
      locale: form.locale,
      published: form.published,
      expiresAt: form.expiresAt
        ? new Date(`${form.expiresAt}T23:59:59`).toISOString()
        : null,
    });

    onStatus(editingId ? "Announcement updated." : "Announcement published.");
    resetForm();
    await load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this announcement?")) return;
    await membersRequest("delete-announcement", { id });
    onStatus("Announcement deleted.");
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="student-section-title">Publish to student dashboard</p>
        <p className="mt-2 font-dm text-sm text-cream/60">
          Students see published messages on their dashboard for their language (or all students).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 md:col-span-2">
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

        <label className="grid gap-1 md:col-span-2">
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

        <label className="grid gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
            Audience
          </span>
          <select
            value={form.locale}
            onChange={(e) =>
              setForm((f) => ({ ...f, locale: e.target.value as AnnouncementLocale }))
            }
            className="form-field"
          >
            {LOCALE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
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

        <label className="flex items-center gap-2 font-dm text-sm text-cream md:col-span-2">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
          />
          Published (visible to students)
        </label>

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button
            type="submit"
            className="bg-orange px-4 py-2 font-mono text-xs uppercase tracking-widest text-background hover:bg-cream"
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
                    {item.locale} · {item.publishedAt ? "Published" : "Draft"}
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
