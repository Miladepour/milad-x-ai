"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { BlogPost } from "@/lib/blog/types";
import type { ContactSubmission } from "@/lib/contact/types";
import type { WaitlistSubmission } from "@/lib/courses/types";

type AdminTab = "blog" | "contact" | "waitlist";

interface AdminSummary {
  contactSubmissions: ContactSubmission[];
  waitlistSubmissions: WaitlistSubmission[];
}

interface SubmissionField {
  label: string;
  value: string;
  wide?: boolean;
}

interface SubmissionCard {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  fields: SubmissionField[];
}

function todayLabel() {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [tab, setTab] = useState<AdminTab>("blog");
  const [status, setStatus] = useState("");
  const [summary, setSummary] = useState<AdminSummary>({
    contactSubmissions: [],
    waitlistSubmissions: [],
  });
  const [post, setPost] = useState({
    locale: "EN",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    date: todayLabel(),
    publishedAt: new Date().toISOString().slice(0, 10),
  });

  const generatedSlug = useMemo(() => slugify(post.title), [post.title]);

  async function adminRequest(action: string, payload = {}) {
    const res = await fetch("/api/admin-console", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Admin request failed");
    return data;
  }

  async function loadSummary() {
    const data = (await adminRequest("summary")) as AdminSummary;
    setSummary(data);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Checking access...");
    try {
      const data = (await adminRequest("login")) as AdminSummary;
      setSummary(data);
      setIsUnlocked(true);
      window.sessionStorage.setItem("milad-admin-password", password);
      setStatus("Unlocked.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not unlock admin.");
    }
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Publishing post...");
    try {
      const publishedAt = new Date(post.publishedAt).toISOString();
      const data = (await adminRequest("publish-post", {
        ...post,
        slug: post.slug || generatedSlug,
        publishedAt,
      })) as { post: BlogPost };
      setPost((current) => ({
        ...current,
        slug: data.post.slug,
      }));
      setStatus(`Published: ${data.post.title}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not publish post.");
    }
  }

  useEffect(() => {
    const stored = window.sessionStorage.getItem("milad-admin-password");
    if (stored) setPassword(stored);
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;
    loadSummary().catch((error) => {
      setStatus(error instanceof Error ? error.message : "Could not refresh inbox.");
    });
  }, [isUnlocked]);

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background text-cream px-6 py-28">
        <form
          onSubmit={handleLogin}
          className="mx-auto flex w-full max-w-md flex-col gap-5 border border-surface bg-surface/40 p-6"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-orange">
              Private console
            </p>
            <h1 className="mt-2 font-dm text-3xl font-semibold text-cream">
              Admin access
            </h1>
          </div>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="form-field"
            placeholder="Admin password"
            autoComplete="current-password"
          />
          <button className="bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream">
            Unlock
          </button>
          {status && <p className="font-dm text-sm text-cream/70">{status}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-cream px-6 py-28">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-surface pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-orange">
              Private console
            </p>
            <h1 className="mt-2 font-dm text-4xl font-semibold text-cream">
              Admin panel
            </h1>
          </div>
          <button
            onClick={() => loadSummary()}
            className="self-start border border-orange px-4 py-2 font-mono text-xs uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background"
          >
            Refresh inbox
          </button>
        </header>

        <div className="flex flex-wrap gap-2">
          {[
            ["blog", "Publish blog"],
            ["contact", `Contact forms (${summary.contactSubmissions.length})`],
            ["waitlist", `Waitlists (${summary.waitlistSubmissions.length})`],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value as AdminTab)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                tab === value
                  ? "bg-orange text-background"
                  : "border border-surface text-cream hover:border-orange"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {status && <p className="font-dm text-sm text-orange">{status}</p>}

        {tab === "blog" && (
          <form onSubmit={handlePublish} className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-4">
              <input
                value={post.title}
                onChange={(event) =>
                  setPost((current) => ({ ...current, title: event.target.value }))
                }
                className="form-field"
                placeholder="Post title"
              />
              <input
                value={post.slug}
                onChange={(event) =>
                  setPost((current) => ({ ...current, slug: event.target.value }))
                }
                className="form-field"
                placeholder={`Slug, blank uses ${generatedSlug || "post-title"}`}
              />
              <textarea
                value={post.excerpt}
                onChange={(event) =>
                  setPost((current) => ({ ...current, excerpt: event.target.value }))
                }
                className="form-field min-h-28"
                placeholder="Short excerpt for the blog listing"
              />
              <textarea
                value={post.content}
                onChange={(event) =>
                  setPost((current) => ({ ...current, content: event.target.value }))
                }
                className="form-field min-h-[360px]"
                placeholder="Full post content. Separate paragraphs with blank lines."
              />
            </div>

            <aside className="flex flex-col gap-4 border border-surface bg-surface/30 p-5">
              <label className="flex flex-col gap-2 font-dm text-sm text-cream/80">
                Language
                <select
                  value={post.locale}
                  onChange={(event) =>
                    setPost((current) => ({ ...current, locale: event.target.value }))
                  }
                  className="form-field"
                >
                  <option value="EN">English</option>
                  <option value="FA">Farsi</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 font-dm text-sm text-cream/80">
                Display date
                <input
                  value={post.date}
                  onChange={(event) =>
                    setPost((current) => ({ ...current, date: event.target.value }))
                  }
                  className="form-field"
                />
              </label>
              <label className="flex flex-col gap-2 font-dm text-sm text-cream/80">
                Publish date
                <input
                  type="date"
                  value={post.publishedAt}
                  onChange={(event) =>
                    setPost((current) => ({
                      ...current,
                      publishedAt: event.target.value,
                    }))
                  }
                  className="form-field"
                />
              </label>
              <button className="mt-2 bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream">
                Publish
              </button>
            </aside>
          </form>
        )}

        {tab === "contact" && (
          <SubmissionList
            empty="No contact forms yet."
            items={summary.contactSubmissions.map((item) => ({
              id: `${item.email}-${item.submittedAt}`,
              title: item.fullName,
              subtitle: `${item.inquiryType} · ${item.country}`,
              date: item.submittedAt,
              fields: [
                { label: "Full name", value: item.fullName },
                { label: "Email", value: item.email },
                { label: "Mobile", value: item.mobile },
                { label: "Country", value: item.country },
                { label: "Inquiry type", value: item.inquiryType },
                { label: "Language", value: item.locale },
                { label: "Submitted at", value: new Date(item.submittedAt).toLocaleString() },
                { label: "Message", value: item.message, wide: true },
              ],
            }))}
          />
        )}

        {tab === "waitlist" && (
          <SubmissionList
            empty="No waitlist forms yet."
            items={summary.waitlistSubmissions.map((item) => ({
              id: `${item.email}-${item.submittedAt}`,
              title: item.fullName,
              subtitle: `${item.courseSlug} · ${item.country}`,
              date: item.submittedAt,
              fields: [
                { label: "Full name", value: item.fullName },
                { label: "Email", value: item.email },
                { label: "Mobile", value: item.mobile },
                { label: "Country", value: item.country },
                { label: "Course", value: item.courseSlug },
                { label: "Language", value: item.locale },
                { label: "Submitted at", value: new Date(item.submittedAt).toLocaleString() },
              ],
            }))}
          />
        )}
      </div>
    </div>
  );
}

function SubmissionList({
  empty,
  items,
}: {
  empty: string;
  items: SubmissionCard[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return items.filter((item) => {
      const submittedTime = new Date(item.date).getTime();
      const matchesDate =
        (!fromTime || submittedTime >= fromTime) &&
        (!toTime || submittedTime <= toTime);

      if (!matchesDate) return false;
      if (!normalizedQuery) return true;

      const searchable = [
        item.title,
        item.subtitle,
        item.date,
        ...item.fields.flatMap((field) => [field.label, field.value]),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [dateFrom, dateTo, items, query]);

  async function copyField(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      window.setTimeout(() => setCopiedField(null), 1200);
    } catch {
      setCopiedField(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="border border-surface bg-surface/20 p-8 font-dm text-cream/70">
        {empty}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 border border-surface bg-surface/20 p-4 md:grid-cols-[1fr_190px_190px_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="form-field"
          placeholder="Search name, email, phone, country, message..."
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          className="form-field"
          aria-label="Filter from date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          className="form-field"
          aria-label="Filter to date"
        />
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setDateFrom("");
            setDateTo("");
          }}
          className="border border-surface px-4 py-3 font-mono text-xs uppercase tracking-widest text-cream transition-colors hover:border-orange hover:text-orange"
        >
          Clear
        </button>
      </div>

      <p className="font-mono text-xs uppercase tracking-widest text-cream/60">
        Showing {filteredItems.length} of {items.length}
      </p>

      {filteredItems.length === 0 ? (
        <div className="border border-surface bg-surface/20 p-8 font-dm text-cream/70">
          No submissions match your filters.
        </div>
      ) : (
        <ul className="grid gap-4">
          {filteredItems.map((item) => {
            const isOpen = openId === item.id;

            return (
              <li key={item.id} className="border border-surface bg-surface/25">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full flex-col gap-3 p-5 text-left transition-colors hover:bg-surface/35 md:flex-row md:items-start md:justify-between"
                  aria-expanded={isOpen}
                >
                  <div>
                    <h2 className="font-dm text-xl font-semibold text-cream">
                      {item.title}
                    </h2>
                    <p className="mt-1 font-dm text-sm text-cream/70">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <time className="font-mono text-xs text-orange">
                      {new Date(item.date).toLocaleString()}
                    </time>
                    <span className="font-mono text-xl text-orange">
                      {isOpen ? "-" : "+"}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-surface p-5">
                    <div className="grid gap-3 md:grid-cols-2">
                      {item.fields.map((field) => {
                        const key = `${item.id}-${field.label}`;

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => copyField(key, field.value)}
                            className={`group border border-surface bg-background/40 p-4 text-left transition-colors hover:border-orange ${
                              field.wide ? "md:col-span-2" : ""
                            }`}
                          >
                            <span className="flex items-center justify-between gap-3 border-b border-surface pb-2">
                              <span className="font-mono text-[10px] uppercase tracking-widest text-orange">
                                {field.label}
                              </span>
                              <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45 group-hover:text-orange">
                                {copiedField === key ? "Copied" : "Copy"}
                              </span>
                            </span>
                            <span className="mt-3 block whitespace-pre-wrap break-words font-dm text-sm leading-relaxed text-cream">
                              {field.value}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
