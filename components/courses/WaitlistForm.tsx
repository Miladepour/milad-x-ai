"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { countries, formatFullMobile, getDialCode } from "@/lib/countries";
import type { Course } from "@/lib/courses";
import { COURSES_BASE_PATH, formatCoursePrice } from "@/lib/courses";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";

interface WaitlistFormProps {
  course: Course;
}

export default function WaitlistForm({ course }: WaitlistFormProps) {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const p = t.coursesPage;
  const w = p.waitlist;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [localMobile, setLocalMobile] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const dialCode = useMemo(() => getDialCode(country), [country]);

  if (!course) return null;

  const coursePath = href(`${COURSES_BASE_PATH}/${course.slug}`);

  function handleCountryChange(code: string) {
    setCountry(code);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!country || !dialCode) return;

    setStatus("loading");
    const mobile = formatFullMobile(dialCode, localMobile);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: course.slug,
          fullName,
          email,
          mobile,
          country,
          locale: lang,
        }),
      });

      if (!res.ok) throw new Error("submit failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-surface border border-orange/30 rounded-sm p-8 md:p-10 text-center">
        <h2 className="type-course-section-heading font-dm font-bold text-cream mb-4">
          {w.successTitle}
        </h2>
        <p className="type-section-body font-dm text-cream leading-relaxed mb-8">
          {w.successMessage}
        </p>
        <Link
          href={coursePath}
          className="inline-flex font-mono text-sm text-orange hover:text-cream transition-colors"
        >
          {w.backToCourse}
        </Link>
      </div>
    );
  }

  return (
    <div dir="ltr" lang="en">
      <div className="mb-8 pb-8 border-b border-surface">
        <p className="font-mono text-orange text-sm mb-2">{course.title}</p>
        <h1 className="type-course-page-title font-dm font-bold text-cream mb-2">
          {w.title}
        </h1>
        <p className="type-course-subtitle font-dm text-cream mb-4">{w.subtitle}</p>
        <div className="flex flex-wrap gap-6 font-dm text-sm text-cream">
          <span>
            <span className="text-cream/80">{p.dateLabel}: </span>
            {course.date}
          </span>
          <span>
            <span className="text-cream/80">{p.priceLabel}: </span>
            <span className="text-orange font-semibold">
              {formatCoursePrice(course.priceUsd, lang)}
            </span>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
        <div>
          <label htmlFor="fullName" className="block font-dm text-sm text-cream mb-2">
            {w.fullName}
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="form-field"
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-dm text-sm text-cream mb-2">
            {w.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-field"
          />
        </div>

        <div>
          <label htmlFor="country" className="block font-dm text-sm text-cream mb-2">
            {w.country}
          </label>
          <select
            id="country"
            name="country"
            required
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="form-field cursor-pointer"
          >
            <option value="" disabled>
              {w.countryPlaceholder}
            </option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="localMobile" className="block font-dm text-sm text-cream mb-2">
            {w.mobile}
          </label>
          <div className="flex gap-0">
            <span
              className={cn(
                "form-field w-[5.5rem] shrink-0 flex items-center justify-center border-r-0 rounded-r-none text-cream font-mono text-sm",
                !country && "text-cream/50"
              )}
              aria-hidden
            >
              {dialCode || "—"}
            </span>
            <input
              id="localMobile"
              name="localMobile"
              type="tel"
              required
              disabled={!country}
              autoComplete="tel-national"
              placeholder={country ? "Phone number" : "Select country first"}
              value={localMobile}
              onChange={(e) => setLocalMobile(e.target.value)}
              className="form-field rounded-l-none flex-1"
            />
          </div>
        </div>

        {status === "error" && (
          <p className="font-dm text-sm text-orange">{w.errorGeneric}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading" || !country}
          className="font-mono text-sm px-8 py-4 bg-orange text-background border-2 border-orange hover:bg-orange-dim transition-colors rounded-sm disabled:opacity-60 disabled:cursor-not-allowed normal-case tracking-normal w-full sm:w-auto"
        >
          {status === "loading" ? w.submitting : w.submit}
        </button>
      </form>
    </div>
  );
}
