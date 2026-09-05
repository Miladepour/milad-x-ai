"use client";

import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import ContactForm from "./ContactForm";

export default function ContactPageContent() {
  const { href } = useLanguage();
  const t = useTranslation();
  const p = t.contactPage;

  return (
    <div className="flex-1 w-full bg-background text-cream flex flex-col">
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24 w-full flex-1">
        <PageBreadcrumb
          ariaLabel={t.navbar.breadcrumbAria}
          className="mb-10"
          items={[
            { label: t.navbar.home, href: href("/") },
            { label: t.navbar.contact, href: href("/contact") },
          ]}
        />

        <p className="type-section-label font-mono text-orange mb-3">{p.label}</p>
        <h1 className="type-course-page-title font-dm font-bold text-cream mb-4">
          {p.title}
        </h1>
        <p className="type-section-body font-dm text-cream max-w-2xl mb-4 leading-relaxed">
          {p.description}
        </p>
        <p className="type-card-body font-dm text-cream/80 max-w-2xl mb-12 leading-relaxed">
          {p.subdescription}
        </p>

        <ContactForm />
      </div>
    </div>
  );
}
