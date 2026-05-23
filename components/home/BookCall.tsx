'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export default function BookCall() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const t = useTranslation();

  return (
    <section ref={ref} style={{ backgroundColor: '#FF5C00' }}>
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16 py-20 flex flex-col md:flex-row items-center justify-between gap-10">

        {/* Left: heading + subtext */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease }}
        >
          <h2
            className="type-book-title font-dm font-bold"
            style={{ color: '#0D0D0D' }}
          >
            {t.bookcall.heading}
          </h2>
          <p
            className="type-book-body font-dm mt-4"
            style={{ color: '#0D0D0D', opacity: 0.65 }}
          >
            {t.bookcall.sub}
          </p>
        </motion.div>

        {/* Right: CTA anchor styled as dark button */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="flex-shrink-0"
        >
          <Link
            href="/contact"
            className="font-mono uppercase tracking-widest rtl:tracking-normal text-sm px-8 py-4 inline-block transition-opacity duration-200 hover:opacity-80"
            style={{
              backgroundColor: '#0D0D0D',
              color: '#F5F0E8',
              borderRadius: '2px',
              border: '2px solid #0D0D0D',
            }}
          >
            {t.bookcall.cta}
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
