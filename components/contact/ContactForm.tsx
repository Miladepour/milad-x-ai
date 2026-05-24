"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import type { ContactInquiryType } from "@/lib/contact/types";
import { countries, formatFullMobile, getDialCode } from "@/lib/countries";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";

export default function ContactForm() {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const p = t.contactPage;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [localMobile, setLocalMobile] = useState("");
  const [inquiryType, setInquiryType] = useState<ContactInquiryType | "">("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const dialCode = useMemo(() => getDialCode(country), [country]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!country || !dialCode || !inquiryType) return;

    setStatus("loading");
    const mobile = formatFullMobile(dialCode, localMobile);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          mobile,
          country,
          inquiryType,
          message,
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
      <div className="bg-surface border border-orange/30 rounded-sm p-8 md:p-10 text-center max-w-lg">
        <h2 className="type-course-section-heading font-dm font-bold text-cream mb-4">
          {p.successTitle}
        </h2>
        <p className="type-section-body font-dm text-cream leading-relaxed mb-8">
          {p.successMessage}
        </p>
        <Link
          href={href("/")}
          className="inline-flex font-mono text-sm text-orange hover:text-cream transition-colors"
        >
          {p.backHome}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
      <fieldset className="space-y-3">
        <legend className="block font-dm text-sm text-cream mb-1">{p.inquiryLabel}</legend>
        <div className="flex flex-col sm:flex-row gap-3">
          <label
            className={cn(
              "flex-1 flex items-start gap-3 border rounded-sm px-4 py-3 cursor-pointer transition-colors",
              inquiryType === "private_course"
                ? "border-orange/60 bg-orange/15"
                : "border-cream/30 bg-surface hover:border-cream/50"
            )}
          >
            <input
              type="radio"
              name="inquiryType"
              value="private_course"
              required
              checked={inquiryType === "private_course"}
              onChange={() => setInquiryType("private_course")}
              className="mt-1 accent-orange"
            />
            <span>
              <span className="block font-dm text-sm font-semibold text-cream">
                {p.inquiryOneOnOne}
              </span>
              <span className="block font-dm text-xs text-cream/70 mt-0.5">
                {p.inquiryOneOnOneHint}
              </span>
            </span>
          </label>
          <label
            className={cn(
              "flex-1 flex items-start gap-3 border rounded-sm px-4 py-3 cursor-pointer transition-colors",
              inquiryType === "collaboration"
                ? "border-orange/60 bg-orange/15"
                : "border-cream/30 bg-surface hover:border-cream/50"
            )}
          >
            <input
              type="radio"
              name="inquiryType"
              value="collaboration"
              required
              checked={inquiryType === "collaboration"}
              onChange={() => setInquiryType("collaboration")}
              className="mt-1 accent-orange"
            />
            <span>
              <span className="block font-dm text-sm font-semibold text-cream">
                {p.inquiryCollaboration}
              </span>
              <span className="block font-dm text-xs text-cream/70 mt-0.5">
                {p.inquiryCollaborationHint}
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="contact-fullName" className="block font-dm text-sm text-cream mb-2">
          {p.fullName}
        </label>
        <input
          id="contact-fullName"
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
        <label htmlFor="contact-email" className="block font-dm text-sm text-cream mb-2">
          {p.email}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-field"
          dir="ltr"
        />
      </div>

      <div>
        <label htmlFor="contact-country" className="block font-dm text-sm text-cream mb-2">
          {p.country}
        </label>
        <select
          id="contact-country"
          name="country"
          required
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="form-field cursor-pointer"
        >
          <option value="" disabled>
            {p.countryPlaceholder}
          </option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-mobile" className="block font-dm text-sm text-cream mb-2">
          {p.mobile}
        </label>
        <div className="flex gap-0" dir="ltr">
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
            id="contact-mobile"
            name="localMobile"
            type="tel"
            required
            disabled={!country}
            autoComplete="tel-national"
            placeholder={country ? p.mobilePlaceholder : p.mobilePlaceholderDisabled}
            value={localMobile}
            onChange={(e) => setLocalMobile(e.target.value)}
            className="form-field rounded-l-none flex-1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="block font-dm text-sm text-cream mb-2">
          {p.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          minLength={10}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={p.messagePlaceholder}
          className="form-field resize-y min-h-[120px]"
        />
      </div>

      {status === "error" && (
        <p className="font-dm text-sm text-orange">{p.errorGeneric}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading" || !country || !inquiryType}
        className="font-mono text-sm px-8 py-4 bg-orange text-background border-2 border-orange hover:bg-orange-dim transition-colors rounded-sm disabled:opacity-60 disabled:cursor-not-allowed normal-case tracking-normal w-full sm:w-auto"
      >
        {status === "loading" ? p.submitting : p.submit}
      </button>
    </form>
  );
}
