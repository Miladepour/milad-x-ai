"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { COURSES_BASE_PATH } from "@/lib/courses";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();
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
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/miladxailogo6.png"
            alt="Milad X AI"
            width={130}
            height={130}
            priority
          />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="font-dm text-sm text-muted hover:text-cream transition-colors"
            >
              {t.navbar.home}
            </Link>
            <Link
              href={COURSES_BASE_PATH}
              className="font-dm text-sm text-muted hover:text-cream transition-colors"
            >
              {t.navbar.courses}
            </Link>
            <Link
              href="/blog"
              className="font-dm text-sm text-muted hover:text-cream transition-colors"
            >
              {t.navbar.blog}
            </Link>
            <Link
              href="/contact"
              className="font-dm text-sm text-muted hover:text-cream transition-colors"
            >
              {t.navbar.contact}
            </Link>
          </div>

          {/* Language toggle — always visible */}
          <button
            onClick={() => setLang(lang === "EN" ? "FA" : "EN")}
            className="font-mono text-xs text-muted hover:text-cream transition-colors tracking-widest"
            aria-label="Toggle language"
          >
            <span className={lang === "EN" ? "text-orange" : "text-muted"}>EN</span>
            <span className="mx-1 text-surface">|</span>
            <span className={lang === "FA" ? "text-orange" : "text-muted"}>FA</span>
          </button>

          {/* Hamburger — mobile only */}
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

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-48 border-b border-surface" : "max-h-0"
        } bg-background/95 backdrop-blur-md`}
      >
        <div className="flex flex-col px-8 py-4 gap-5">
          <Link
            href="/"
            className="font-dm text-sm text-cream hover:text-orange transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            {t.navbar.home}
          </Link>
          <Link
            href={COURSES_BASE_PATH}
            className="font-dm text-sm text-cream hover:text-orange transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            {t.navbar.courses}
          </Link>
          <Link
            href="/blog"
            className="font-dm text-sm text-cream hover:text-orange transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            {t.navbar.blog}
          </Link>
          <Link
            href="/contact"
            className="font-dm text-sm text-cream hover:text-orange transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            {t.navbar.contact}
          </Link>
        </div>
      </div>
    </header>
  );
}
