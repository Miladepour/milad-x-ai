'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button';
import { COURSES_BASE_PATH } from '@/lib/courses';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslation } from '@/lib/i18n/useTranslation';

function IconInstagram() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconLinkedin() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Hero() {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const textDir = lang === 'FA' ? 'rtl' : 'ltr';

  return (
    <section
      dir="ltr"
      className="relative w-full min-h-screen bg-background overflow-x-hidden"
    >
      {/* Radial glow — bottom-left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 65% at 0% 100%, rgba(255,92,0,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Floating orb */}
      <div
        className="absolute bottom-28 left-8 w-48 h-48 md:left-24 md:w-72 md:h-72 rounded-full pointer-events-none hero-orb"
        style={{
          background: 'radial-gradient(circle, rgba(255,92,0,0.12) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />

      {/* Main content — always left on desktop (LTR layout); text direction follows language */}
      <div className="hero-content relative z-10 flex flex-col justify-center min-h-screen px-8 md:px-12 lg:px-16 md:max-w-[55%] py-24 md:py-16">
        <div className="max-w-3xl w-full" dir={textDir}>
          <p className="type-hero-tag font-mono text-orange hero-tag-animated text-start mb-4 md:mb-5 tracking-[0.2em] rtl:tracking-normal">
            {t.hero.tag}
          </p>

          {t.hero.h1.map((line, i) => (
            <div key={i} className="overflow-hidden">
              <h1 className="type-hero-h1 font-dm font-bold text-cream select-none">
                {line}
              </h1>
            </div>
          ))}

          <h2 className="type-hero-quote font-dm font-normal italic text-orange mt-5 leading-snug border-s-2 border-orange ps-4 max-w-[400px] rtl:max-w-[360px] rtl:mt-4">
            {t.hero.quoteLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h2>

          <p className="type-hero-body font-dm text-muted mt-4 leading-relaxed max-w-[400px] rtl:max-w-[360px] rtl:mt-3">
            {t.hero.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-8 rtl:mt-6">
            <Button variant="primary" size="lg" href={href("/consultation")}>
              {t.hero.cta1}
            </Button>
            <Button variant="outline" size="lg" href={href(COURSES_BASE_PATH)}>
              {t.hero.cta2}
            </Button>
          </div>

          <div className="flex items-center gap-5 mt-6">
            <a
              href="https://www.instagram.com/miladxaitalks/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-orange transition-colors duration-200"
              aria-label="Instagram"
            >
              <IconInstagram />
            </a>
            <a
              href="https://www.youtube.com/@miladxtalks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-orange transition-colors duration-200"
              aria-label="YouTube"
            >
              <IconYoutube />
            </a>
            <a
              href="https://www.linkedin.com/in/milad-epour/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-orange transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <IconLinkedin />
            </a>
          </div>
        </div>
      </div>

      {/* Hero image — right side */}
      <div className="absolute right-0 top-0 bottom-0 min-h-screen w-[45%] hidden md:block">
        <div className="relative h-full w-full">
          <Image
            src="/images/milad-hero2.jpg"
            alt="Milad"
            fill
            priority
            quality={100}
            sizes="(max-width: 768px) 0px, 100vw"
            className="object-cover object-top hero-image-mask"
          />
          <div
            className="absolute inset-0 pointer-events-none hero-image-fade"
          />
        </div>
      </div>

      {/* Bottom-right: SCROLL */}
      <div className="absolute bottom-8 right-10 flex flex-col items-center gap-3">
        <span
          className="type-hero-scroll font-mono text-muted uppercase rtl:tracking-normal"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}
        >
          {t.hero.scroll}
        </span>
        <div className="w-px h-10 bg-muted opacity-30" />
      </div>

    </section>
  );
}
