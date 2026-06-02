'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Button from '@/components/ui/Button';
import PortfolioSections from '@/components/portfolio/PortfolioSections';
import { PORTFOLIO_BASE_PATH } from '@/lib/portfolio/constants';
import { portfolioSquareImages } from '@/lib/portfolio/media';
import { useLanguage } from '@/lib/i18n/context';
import { useTranslation } from '@/lib/i18n/useTranslation';

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export default function AIWork() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { href } = useLanguage();
  const t = useTranslation();
  const w = t.aiwork;

  return (
    <section
      id="work"
      ref={ref}
      className="w-full bg-background py-28 px-8 md:px-12 lg:px-16"
    >
      <div className="max-w-6xl mx-auto overflow-visible px-1">

        <div className="mb-14">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease }}
            className="type-section-label font-mono text-orange uppercase tracking-[0.35em] rtl:tracking-normal"
          >
            {w.label}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.1, ease }}
            className="type-course-page-title font-dm font-bold text-cream leading-tight m-0 mt-1"
          >
            {w.heading}
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease }}
        >
          <PortfolioSections
            showApplications={false}
            showImages={portfolioSquareImages.length > 0}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35, ease }}
          className="flex justify-center mt-12"
        >
          <Button variant="outline" size="lg" href={href(PORTFOLIO_BASE_PATH)}>
            {w.cta}
          </Button>
        </motion.div>

      </div>
    </section>
  );
}
