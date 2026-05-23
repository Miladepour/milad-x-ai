'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n/useTranslation';

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export default function AIWork() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const t = useTranslation();
  const projects = t.aiwork.projects;

  return (
    <section ref={ref} className="w-full bg-background py-28 px-8 md:px-12 lg:px-16">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="mb-14">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease }}
            className="type-section-label font-mono text-orange uppercase tracking-[0.35em] rtl:tracking-normal"
          >
            {t.aiwork.label}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.1, ease }}
            className="type-hero-h1 font-dm font-bold text-cream mt-3"
          >
            {t.aiwork.heading}
          </motion.h2>
        </div>

        {/* Asymmetric masonry grid */}
        <div className="grid grid-cols-12 gap-3">

          {/* 2 large cards */}
          {projects.filter((p) => p.size === 'large').map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 56 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.18 + i * 0.13, ease }}
              className="col-span-12 md:col-span-6 relative overflow-hidden group cursor-pointer"
              style={{ borderRadius: '2px', height: '420px' }}
            >
              <div className="absolute inset-0 bg-surface" />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6"
                style={{
                  background:
                    'linear-gradient(to top, rgba(255,92,0,0.88) 0%, transparent 62%)',
                }}
              >
                <h3 className="type-card-title-lg font-dm font-semibold text-cream leading-tight">
                  {project.title}
                </h3>
              </div>
            </motion.div>
          ))}

          {/* 3 small cards */}
          {projects.filter((p) => p.size === 'small').map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 56 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.42 + i * 0.13, ease }}
              className="col-span-12 md:col-span-4 relative overflow-hidden group cursor-pointer"
              style={{ borderRadius: '2px', height: '280px' }}
            >
              <div className="absolute inset-0 bg-surface" />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5"
                style={{
                  background:
                    'linear-gradient(to top, rgba(255,92,0,0.88) 0%, transparent 62%)',
                }}
              >
                <h3 className="type-card-title font-dm font-semibold text-cream leading-tight">
                  {project.title}
                </h3>
              </div>
            </motion.div>
          ))}

        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.75, ease }}
          className="flex justify-center mt-14"
        >
          <Button
            variant="outline"
            size="lg"
            href="https://www.instagram.com/miladxaitalks/"
          >
            {t.aiwork.cta}
          </Button>
        </motion.div>

      </div>
    </section>
  );
}
