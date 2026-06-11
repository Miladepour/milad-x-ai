"use client";

import Link from "next/link";
import { CONSULTATION_BASE_PATH } from "@/lib/consultation/constants";
import { COURSES_BASE_PATH } from "@/lib/courses";
import { PORTFOLIO_BASE_PATH } from "@/lib/portfolio/constants";
import { TUTORIALS_BASE_PATH } from "@/lib/tutorials/constants";
import { toLocaleDigits } from "@/lib/i18n/digits";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";

const WORKSHOP_SLUG = "prompt-to-content";

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

const footerLinkClass =
  "font-dm text-sm text-cream/75 hover:text-orange transition-colors";

export default function Footer() {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const f = t.footer;
  const n = t.navbar;
  const year = toLocaleDigits(String(new Date().getFullYear()), lang);

  const exploreLinks = [
    { href: href("/"), label: n.home },
    { href: href(PORTFOLIO_BASE_PATH), label: n.portfolio },
    { href: href(COURSES_BASE_PATH), label: n.courses },
    { href: href(TUTORIALS_BASE_PATH), label: n.tutorials },
    { href: href("/blog"), label: n.blog },
    { href: href(CONSULTATION_BASE_PATH), label: n.consultation },
    { href: href("/contact"), label: n.contact },
  ];

  const offeringLinks = [
    { href: href(TUTORIALS_BASE_PATH), label: f.offeringTutorials },
    {
      href: href(`${COURSES_BASE_PATH}/${WORKSHOP_SLUG}`),
      label: f.offeringWorkshop,
    },
    { href: href(COURSES_BASE_PATH), label: f.offeringPrivate },
    { href: href(CONSULTATION_BASE_PATH), label: f.offeringConsultation },
  ];

  const socialLinks = [
    {
      href: "https://www.instagram.com/miladxaitalks/",
      label: "Instagram",
      icon: IconInstagram,
    },
    {
      href: "https://www.linkedin.com/in/milad-epour/",
      label: "LinkedIn",
      icon: IconLinkedIn,
    },
    {
      href: "https://www.youtube.com/@miladxtalks",
      label: "YouTube",
      icon: IconYouTube,
    },
  ];

  return (
    <footer className="border-t border-surface bg-background mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 py-12 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1 lg:max-w-sm">
            <Link href={href("/")} className="inline-block group">
              <p className="font-dm text-lg font-bold text-cream group-hover:text-orange transition-colors">
                {f.brandName}
              </p>
            </Link>
            <p className="font-mono text-xs text-orange mt-2 tracking-wide rtl:tracking-normal">
              {f.tagline}
            </p>
            <p className="font-dm text-sm text-cream/70 mt-4 leading-relaxed">
              {f.description}
            </p>
            <p className="font-dm text-xs text-muted mt-4">{f.location}</p>
            <p className="font-dm text-xs text-muted mt-1">{f.locationSecondary}</p>
          </div>

          <nav aria-label={f.exploreTitle}>
            <h2 className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-4">
              {f.exploreTitle}
            </h2>
            <ul className="space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={f.offeringsTitle}>
            <h2 className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-4">
              {f.offeringsTitle}
            </h2>
            <ul className="space-y-2.5">
              {offeringLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-xs text-orange uppercase tracking-widest rtl:tracking-normal mb-4">
              {f.connectTitle}
            </h2>
            <Link
              href={href("/contact")}
              className="inline-block font-dm text-sm font-semibold text-orange hover:text-cream transition-colors mb-5"
            >
              {f.contactCta} →
            </Link>
            <p className="font-mono text-xs text-muted uppercase tracking-widest rtl:tracking-normal mb-3">
              {f.followTitle}
            </p>
            <ul className="flex items-center gap-4">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={label}
                    className="text-cream/60 hover:text-orange transition-colors"
                  >
                    <Icon />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-surface flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-dm text-xs text-muted text-center sm:text-start">
            © {year} {f.copyrightName}. {f.rights}
          </p>
          <nav
            aria-label={f.legalTitle}
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end"
          >
            <Link href={href("/privacy-policy")} className={footerLinkClass}>
              {f.privacyPolicy}
            </Link>
            <Link href={href("/terms-and-conditions")} className={footerLinkClass}>
              {f.termsAndConditions}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
