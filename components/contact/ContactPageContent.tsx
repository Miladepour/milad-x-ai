"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import ContactForm from "./ContactForm";

export default function ContactPageContent() {
  const t = useTranslation();
  const p = t.contactPage;

  return (
    <div className="flex-1 w-full bg-background text-cream flex flex-col">
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 pt-32 pb-24 w-full flex-1">
        <Link
          href="/"
          className="font-dm text-sm text-muted hover:text-cream transition-colors mb-10 inline-block"
        >
          {p.backHome}
        </Link>

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
