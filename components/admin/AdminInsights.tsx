"use client";

import type { AdminInsights } from "@/lib/admin/insights";
import type { AdminTab } from "@/components/admin/AdminShell";

interface AdminInsightsProps {
  insights: AdminInsights;
  onNavigate: (tab: AdminTab) => void;
}

function StatCard({
  label,
  value,
  hint,
  accent,
  onClick,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`student-glass text-left transition-colors ${
        accent ? "student-glass-accent border-orange/30" : ""
      } ${onClick ? "hover:border-orange/40" : ""}`}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-cream/50">{label}</p>
      <p className={`mt-2 font-dm text-3xl font-semibold ${accent ? "text-orange" : "text-cream"}`}>
        {value}
      </p>
      {hint && <p className="mt-1 font-dm text-xs text-cream/45">{hint}</p>}
    </Tag>
  );
}

export default function AdminInsightsPanel({ insights, onNavigate }: AdminInsightsProps) {
  const { counts, recentUnopenedContact, recentUnopenedWaitlist, recentBlogPosts } = insights;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Students"
          value={counts.students}
          hint={`${counts.activeEnrollments} active enrollments`}
          onClick={() => onNavigate("students")}
        />
        <StatCard
          label="Courses published"
          value={counts.publishedCourses}
          hint={`${counts.coursesTotal} in catalog`}
          onClick={() => onNavigate("courses")}
        />
        <StatCard
          label="Programs published"
          value={counts.publishedPrograms}
          hint={`${counts.programsTotal} total programs`}
          onClick={() => onNavigate("programs")}
        />
        <StatCard
          label="Contact inbox"
          value={counts.unopenedContact}
          hint={
            counts.unopenedContact > 0
              ? `${counts.contactTotal} total · unopened`
              : `${counts.contactTotal} total · all read`
          }
          accent={counts.unopenedContact > 0}
          onClick={() => onNavigate("contact")}
        />
        <StatCard
          label="Waitlist inbox"
          value={counts.unopenedWaitlist}
          hint={
            counts.unopenedWaitlist > 0
              ? `${counts.waitlistTotal} total · unopened`
              : `${counts.waitlistTotal} total · all read`
          }
          accent={counts.unopenedWaitlist > 0}
          onClick={() => onNavigate("waitlist")}
        />
        <StatCard
          label="Blog posts"
          value={counts.blogPosts}
          hint={`${counts.blogPostsEn} EN · ${counts.blogPostsFa} FA`}
          onClick={() => onNavigate("blog")}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="student-glass">
          <div className="flex items-center justify-between gap-3">
            <h2 className="student-section-title">Unopened contact</h2>
            <button
              type="button"
              onClick={() => onNavigate("contact")}
              className="font-mono text-[10px] uppercase tracking-widest text-orange hover:text-cream"
            >
              Inbox →
            </button>
          </div>
          {recentUnopenedContact.length === 0 ? (
            <p className="mt-4 font-dm text-sm text-cream/55">No unopened messages.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentUnopenedContact.map((item) => (
                <li key={item.id} className="student-glass-pill border-orange/20 px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-dm text-sm font-medium text-cream">{item.fullName}</p>
                    <span className="shrink-0 rounded-full bg-orange/20 px-2 py-0.5 font-mono text-[9px] uppercase text-orange">
                      New
                    </span>
                  </div>
                  <p className="mt-0.5 font-dm text-xs text-cream/55">
                    {item.inquiryType.replace("_", " ")} · {item.country}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-cream/40">
                    {new Date(item.submittedAt).toLocaleString("en-GB")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="student-glass">
          <div className="flex items-center justify-between gap-3">
            <h2 className="student-section-title">Unopened waitlist</h2>
            <button
              type="button"
              onClick={() => onNavigate("waitlist")}
              className="font-mono text-[10px] uppercase tracking-widest text-orange hover:text-cream"
            >
              Inbox →
            </button>
          </div>
          {recentUnopenedWaitlist.length === 0 ? (
            <p className="mt-4 font-dm text-sm text-cream/55">No unopened signups.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentUnopenedWaitlist.map((item) => (
                <li key={item.id} className="student-glass-pill border-orange/20 px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-dm text-sm font-medium text-cream">{item.fullName}</p>
                    <span className="shrink-0 rounded-full bg-orange/20 px-2 py-0.5 font-mono text-[9px] uppercase text-orange">
                      New
                    </span>
                  </div>
                  <p className="mt-0.5 font-dm text-xs text-cream/55">{item.courseSlug}</p>
                  <p className="mt-1 font-mono text-[10px] text-cream/40">
                    {new Date(item.submittedAt).toLocaleString("en-GB")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="student-glass">
          <div className="flex items-center justify-between gap-3">
            <h2 className="student-section-title">Blog insights</h2>
            <button
              type="button"
              onClick={() => onNavigate("blog")}
              className="font-mono text-[10px] uppercase tracking-widest text-orange hover:text-cream"
            >
              Editor →
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="student-glass-pill px-4 py-3 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-cream/45">English</p>
              <p className="mt-1 font-dm text-2xl font-semibold text-cream">{counts.blogPostsEn}</p>
            </div>
            <div className="student-glass-pill px-4 py-3 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-cream/45">Farsi</p>
              <p className="mt-1 font-dm text-2xl font-semibold text-cream">{counts.blogPostsFa}</p>
            </div>
          </div>
          {recentBlogPosts.length === 0 ? (
            <p className="mt-4 font-dm text-sm text-cream/55">No published posts yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentBlogPosts.map((post) => (
                <li key={`${post.slug}-${post.locale}`} className="student-glass-pill px-4 py-3">
                  <p className="font-dm text-sm font-medium text-cream line-clamp-1">{post.title}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-cream/45">
                    {post.locale} · {post.slug}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
