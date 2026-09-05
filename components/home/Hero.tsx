'use client';

import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { COURSES_BASE_PATH } from '@/lib/courses';
import { CONSULTATION_BASE_PATH } from '@/lib/consultation/constants';
import { PRIVATE_AI_COURSE_BASE_PATH } from '@/lib/private-ai-course/constants';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslation } from '@/lib/i18n/useTranslation';

const HERO_IMAGE = '/images/home-page-hero/ai-courses-milad-x-talks-mx-ai-academy.jpeg';

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
      aria-labelledby="home-hero-title"
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-background"
    >
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={HERO_IMAGE}
          alt={t.hero.imageAlt}
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-[62%_center] sm:object-[60%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,13,13,0.2)_0%,rgba(13,13,13,0.46)_38%,rgba(13,13,13,0.86)_72%,#0D0D0D_100%)] md:hidden" />
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              'linear-gradient(90deg, #0D0D0D 0%, rgba(13,13,13,0.96) 30%, rgba(13,13,13,0.78) 52%, rgba(13,13,13,0.18) 78%, rgba(13,13,13,0) 100%), linear-gradient(0deg, #0D0D0D 0%, rgba(13,13,13,0) 24%)',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] w-full flex-col justify-center px-8 pb-12 pt-44 sm:px-10 sm:pt-48 md:max-w-[68%] md:px-12 md:pb-16 md:pt-24 lg:max-w-[64%] lg:px-16 xl:max-w-[60%]">
        <div className="max-w-3xl w-full" dir={textDir}>
          <p className="type-hero-tag max-w-xl text-start font-mono leading-relaxed text-orange mb-4 md:mb-5">
            {t.hero.tag}
          </p>

          <h1
            id="home-hero-title"
            className={`type-hero-h1 select-none text-start font-dm font-bold text-cream ${
              lang === 'EN' ? 'md:text-[clamp(42px,4.2vw,58px)]' : ''
            }`}
          >
            {t.hero.h1.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p className="type-hero-body mt-5 max-w-[56ch] text-start font-dm leading-relaxed text-cream/75">
            {t.hero.description}
          </p>

          <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Button
              variant="primary"
              size="lg"
              href={href(COURSES_BASE_PATH)}
              className="w-full whitespace-nowrap text-center sm:w-auto"
            >
              {t.hero.cta1}
            </Button>
            <Button
              variant="outline"
              size="lg"
              href={href(PRIVATE_AI_COURSE_BASE_PATH)}
              className="w-full whitespace-nowrap text-center sm:w-auto"
            >
              {t.hero.cta2}
            </Button>
          </div>

          <Link
            href={href(CONSULTATION_BASE_PATH)}
            className="mt-4 inline-flex w-fit border-b border-cream/20 pb-1 font-dm text-sm text-cream/70 transition-colors hover:border-orange/60 hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            {t.hero.consultationLink}
          </Link>

          <div className="mt-5 flex items-center gap-5">
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

      <div className="absolute bottom-8 right-10 hidden flex-col items-center gap-3 md:flex">
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
