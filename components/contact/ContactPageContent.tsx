"use client";

import { CONTACT_BASE_PATH } from "@/lib/contact/constants";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import PageHero from "@/components/shared/PageHero";
import ContactForm from "./ContactForm";

export default function ContactPageContent({
  heroSrc,
}: {
  heroSrc?: string | null;
}) {
  const { href } = useLanguage();
  const t = useTranslation();
  const p = t.contactPage;

  const intro = (
    <>
      <PageBreadcrumb
        ariaLabel={t.navbar.breadcrumbAria}
        variant={heroSrc ? "hero" : "default"}
        className={heroSrc ? "mb-8" : "mb-10"}
        items={[
          { label: t.navbar.home, href: href("/") },
          { label: t.navbar.contact, href: href(CONTACT_BASE_PATH) },
        ]}
      />

      <p className="type-section-label font-mono text-orange mb-3">{p.label}</p>
      <h1 className="type-course-page-title font-dm font-bold text-cream mb-4">
        {p.title}
      </h1>
      <p className="type-section-body font-dm text-cream max-w-2xl mb-4 leading-relaxed">
        {p.description}
      </p>
      <p className="type-section-body font-dm text-cream/90 max-w-2xl mb-4 leading-relaxed">
        {p.subdescription}
      </p>
      <p className="type-card-body font-dm text-cream/80 max-w-2xl leading-relaxed">
        {p.heroNote}
      </p>
    </>
  );

  return (
    <div className="flex-1 w-full bg-background text-cream flex flex-col">
      {heroSrc ? <PageHero src={heroSrc} alt={p.title}>{intro}</PageHero> : null}

      <div
        className={
          heroSrc
            ? "max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-12 md:pt-16 pb-24 w-full flex-1"
            : "max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24 w-full flex-1"
        }
      >
        {heroSrc ? null : <div className="mb-12">{intro}</div>}
        <ContactForm />
      </div>
    </div>
  );
}
