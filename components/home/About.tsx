'use client';

import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const t = useTranslation();

  return (
    <section ref={ref} className="w-full bg-background py-28 px-8 md:px-12 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-stretch gap-0">

          {/* Left: image placeholder */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease }}
            className="w-full md:w-[42%] flex-shrink-0"
          >
            <div
              className="w-full bg-surface overflow-hidden"
              style={{ borderRadius: '2px', height: '520px', position: 'relative' }}
            >
              <Image
                src="/images/about-me-milad.jpeg"
                alt="Milad"
                fill
                className="object-cover object-top"
              />
            </div>
          </motion.div>

          {/* Orange vertical accent */}
          <div className="hidden md:block w-px bg-orange mx-10 flex-shrink-0" />

          {/* Right: text + stats */}
          <div className="flex flex-col justify-center gap-7 flex-1 mt-12 md:mt-0">

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.75, delay: 0.1, ease }}
              className="flex flex-col gap-3"
            >
              <span className="type-section-label font-mono text-orange uppercase tracking-widest rtl:tracking-normal">
                {t.about.label}
              </span>
              <h2 className="type-hero-h1 font-dm font-bold text-cream">
                {t.about.heading1}<br />{t.about.heading2}
              </h2>
            </motion.div>

            <div className="flex flex-col gap-5">
              {t.about.paragraphs.map((text, i) => (
                <motion.p
                  key={i}
                  initial={{ y: 28, opacity: 0 }}
                  animate={inView ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.65, delay: 0.28 + i * 0.12, ease }}
                  className="type-section-body font-dm text-muted leading-relaxed"
                >
                  {text}
                </motion.p>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
