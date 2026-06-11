"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import StudentNavButton from "@/components/layout/StudentNavButton";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { localizedPath } from "@/lib/i18n/paths";
import { COURSES_BASE_PATH } from "@/lib/courses";
import { CONSULTATION_BASE_PATH } from "@/lib/consultation/constants";
import { PORTFOLIO_BASE_PATH } from "@/lib/portfolio/constants";
import { TUTORIALS_BASE_PATH } from "@/lib/tutorials/constants";
import type { UrlLocale } from "@/lib/i18n/config";

function isNavActive(
  pathname: string,
  logicalPath: string,
  urlLocale: UrlLocale
) {
  const target = localizedPath(logicalPath, urlLocale);
  if (logicalPath === "/") {
    return pathname === target || pathname === `${target}/`;
  }
  return pathname === target || pathname.startsWith(`${target}/`);
}

function isStudentAreaActive(pathname: string, urlLocale: UrlLocale) {
  const login = localizedPath("/account/login", "en");
  const learn = localizedPath("/learn", urlLocale);
  const learnEn = localizedPath("/learn", "en");
  const learnFa = localizedPath("/learn", "fa");
  return (
    pathname === login ||
    pathname.startsWith(`${login}/`) ||
    pathname === learn ||
    pathname.startsWith(`${learn}/`) ||
    pathname === learnEn ||
    pathname.startsWith(`${learnEn}/`) ||
    pathname === learnFa ||
    pathname.startsWith(`${learnFa}/`)
  );
}

function isLearnPortalActive(pathname: string, urlLocale: UrlLocale) {
  const learn = localizedPath("/learn", urlLocale);
  return pathname === learn || pathname.startsWith(`${learn}/`);
}

function navLinkClass(active: boolean, variant: "desktop" | "mobile") {
  const base = "font-dm text-sm transition-colors";
  if (variant === "desktop") {
    return `${base} ${active ? "text-orange" : "text-muted hover:text-cream"}`;
  }
  return `${base} ${active ? "text-orange" : "text-cream hover:text-orange"}`;
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, urlLocale, setLang, href } = useLanguage();
  const t = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-surface"
          : "bg-transparent"
      }`}
    >
      <nav className="px-8 md:px-12 lg:px-16 h-20 flex items-center justify-between">
        <Link
          href={isLearnPortalActive(pathname, urlLocale) ? href("/learn") : href("/")}
          className="flex items-center"
        >
          <Image
            src="/images/miladxailogo9.png"
            alt="Milad X AI"
            width={98}
            height={98}
            className="h-[97.5px] w-[97.5px] object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8">
            <Link
              href={href("/")}
              className={navLinkClass(isNavActive(pathname, "/", urlLocale), "desktop")}
            >
              {t.navbar.home}
            </Link>
            <Link
              href={href(PORTFOLIO_BASE_PATH)}
              className={navLinkClass(
                isNavActive(pathname, PORTFOLIO_BASE_PATH, urlLocale),
                "desktop"
              )}
            >
              {t.navbar.portfolio}
            </Link>
            <Link
              href={href(COURSES_BASE_PATH)}
              className={navLinkClass(
                isNavActive(pathname, COURSES_BASE_PATH, urlLocale),
                "desktop"
              )}
            >
              {t.navbar.courses}
            </Link>
            <Link
              href={href(TUTORIALS_BASE_PATH)}
              className={navLinkClass(
                isNavActive(pathname, TUTORIALS_BASE_PATH, urlLocale),
                "desktop"
              )}
            >
              {t.navbar.tutorials}
            </Link>
            <Link
              href={href("/blog")}
              className={navLinkClass(isNavActive(pathname, "/blog", urlLocale), "desktop")}
            >
              {t.navbar.blog}
            </Link>
            <Link
              href={href(CONSULTATION_BASE_PATH)}
              className={navLinkClass(
                isNavActive(pathname, CONSULTATION_BASE_PATH, urlLocale),
                "desktop"
              )}
            >
              {t.navbar.consultation}
            </Link>
            <Link
              href={href("/contact")}
              className={navLinkClass(isNavActive(pathname, "/contact", urlLocale), "desktop")}
            >
              {t.navbar.contact}
            </Link>
            <StudentNavButton
              urlLocale={urlLocale}
              active={isStudentAreaActive(pathname, urlLocale)}
              loginLabel={t.navbar.studentLogin}
              loginAria={t.navbar.studentLoginAria}
              dashboardLabel={t.navbar.studentDashboard}
              dashboardAria={t.navbar.studentDashboardAria}
            />
          </div>

          <button
            onClick={() => setLang(lang === "EN" ? "FA" : "EN")}
            className="font-mono text-xs text-muted hover:text-cream transition-colors tracking-widest"
            aria-label="Toggle language"
          >
            <span className={lang === "EN" ? "text-orange" : "text-muted"}>EN</span>
            <span className="mx-1 text-surface">|</span>
            <span className={lang === "FA" ? "text-orange" : "text-muted"}>FA</span>
          </button>

          <button
            className="group md:hidden relative flex h-8 w-8 items-center justify-center"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`absolute h-[2px] w-6 origin-center rounded-full bg-orange shadow-[0_0_12px_rgba(255,92,0,0.35)] transition-all duration-300 ease-out group-hover:bg-cream ${
                menuOpen ? "translate-y-0 rotate-45" : "-translate-y-[7px]"
              }`}
            />
            <span
              className={`absolute h-[2px] origin-center rounded-full bg-orange shadow-[0_0_12px_rgba(255,92,0,0.35)] transition-all duration-300 ease-out group-hover:bg-cream ${
                menuOpen ? "w-0 opacity-0" : "w-6 opacity-100"
              }`}
            />
            <span
              className={`absolute h-[2px] w-6 origin-center rounded-full bg-orange shadow-[0_0_12px_rgba(255,92,0,0.35)] transition-all duration-300 ease-out group-hover:bg-cream ${
                menuOpen ? "translate-y-0 -rotate-45" : "translate-y-[7px]"
              }`}
            />
          </button>
        </div>
      </nav>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-80 border-b border-surface" : "max-h-0"
        } bg-background/95 backdrop-blur-md`}
      >
        <div className="flex flex-col px-8 py-4 gap-5">
          <StudentNavButton
            urlLocale={urlLocale}
            active={isStudentAreaActive(pathname, urlLocale)}
            loginLabel={t.navbar.studentLogin}
            loginAria={t.navbar.studentLoginAria}
            dashboardLabel={t.navbar.studentDashboard}
            dashboardAria={t.navbar.studentDashboardAria}
            className="w-full"
            onNavigate={() => setMenuOpen(false)}
          />
          <Link
            href={href("/")}
            className={navLinkClass(isNavActive(pathname, "/", urlLocale), "mobile")}
            onClick={() => setMenuOpen(false)}
          >
            {t.navbar.home}
          </Link>
          <Link
            href={href(PORTFOLIO_BASE_PATH)}
            className={navLinkClass(
              isNavActive(pathname, PORTFOLIO_BASE_PATH, urlLocale),
              "mobile"
            )}
            onClick={() => setMenuOpen(false)}
          >
            {t.navbar.portfolio}
          </Link>
          <Link
            href={href(COURSES_BASE_PATH)}
            className={navLinkClass(
              isNavActive(pathname, COURSES_BASE_PATH, urlLocale),
              "mobile"
            )}
            onClick={() => setMenuOpen(false)}
          >
            {t.navbar.courses}
          </Link>
          <Link
            href={href(TUTORIALS_BASE_PATH)}
            className={navLinkClass(
              isNavActive(pathname, TUTORIALS_BASE_PATH, urlLocale),
              "mobile"
            )}
            onClick={() => setMenuOpen(false)}
          >
            {t.navbar.tutorials}
          </Link>
          <Link
            href={href("/blog")}
            className={navLinkClass(isNavActive(pathname, "/blog", urlLocale), "mobile")}
            onClick={() => setMenuOpen(false)}
          >
            {t.navbar.blog}
          </Link>
          <Link
            href={href(CONSULTATION_BASE_PATH)}
            className={navLinkClass(
              isNavActive(pathname, CONSULTATION_BASE_PATH, urlLocale),
              "mobile"
            )}
            onClick={() => setMenuOpen(false)}
          >
            {t.navbar.consultation}
          </Link>
          <Link
            href={href("/contact")}
            className={navLinkClass(isNavActive(pathname, "/contact", urlLocale), "mobile")}
            onClick={() => setMenuOpen(false)}
          >
            {t.navbar.contact}
          </Link>
        </div>
      </div>
    </header>
  );
}
