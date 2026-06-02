"use client";

import Link from "next/link";
import InstructorAboutSection from "@/components/shared/InstructorAboutSection";
import { toLocaleDigits } from "@/lib/i18n/digits";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  CONSULTATION_BOOKING_URL,
  CONSULTATION_PRICE_USD,
} from "@/lib/consultation/constants";

const btnPrimary =
  "inline-flex items-center justify-center font-mono px-8 py-4 text-sm uppercase tracking-widest rtl:tracking-normal bg-orange text-background border-2 border-orange hover:bg-orange-dim hover:border-orange-dim transition-colors duration-200 rounded-sm";

export default function ConsultationPageContent() {
  const { href, lang } = useLanguage();
  const t = useTranslation();
  const p = t.consultationPage;
  const price =
    lang === "FA"
      ? `${toLocaleDigits(CONSULTATION_PRICE_USD, lang)} دلار`
      : `$${CONSULTATION_PRICE_USD}`;

  return (
    <div className="flex-1 w-full bg-background text-cream flex flex-col">
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24 w-full flex-1">
        <Link
          href={href("/")}
          className="font-dm text-sm text-muted hover:text-cream transition-colors mb-10 inline-block"
        >
          {p.backHome}
        </Link>

        <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-10 items-start">
          <div>
            <p className="type-section-label font-mono text-orange mb-3">{p.label}</p>
            <h1 className="type-course-page-title font-dm font-bold text-cream mb-4">
              {p.title}
            </h1>
            <p className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-6">
              {p.duration}
            </p>
            <p className="type-section-body font-dm text-cream max-w-2xl mb-10 leading-relaxed">
              {p.description}
            </p>

            <h2 className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-4">
              {p.whatWeCover}
            </h2>
            <ul className="space-y-3 font-dm text-cream/85 leading-relaxed max-w-2xl">
              {p.bullets.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-orange shrink-0" aria-hidden>
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="flex flex-col gap-4 border border-surface bg-surface/30 p-6 lg:sticky lg:top-28">
            <div>
              <p className="font-mono text-xs text-cream/60 uppercase tracking-widest rtl:tracking-normal mb-2">
                {p.priceLabel}
              </p>
              <p className="font-dm text-4xl font-bold text-cream">{price}</p>
            </div>
            <a
              href={CONSULTATION_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={btnPrimary}
            >
              {p.bookCta}
            </a>
            <p className="font-dm text-xs text-cream/60 leading-relaxed">{p.bookHint}</p>
          </aside>
        </div>

        <InstructorAboutSection className="mt-16 pt-16" />
      </div>
    </div>
  );
}
