"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CONSULTATION_BASE_PATH } from "@/lib/consultation/constants";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import ConsultationBannerIllustration from "./ConsultationBannerIllustration";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

interface ConsultationCtaBannerProps {
  className?: string;
  /** When true, renders only the card (for use inside page content). */
  embedded?: boolean;
}

export default function ConsultationCtaBanner({
  className = "",
  embedded = false,
}: ConsultationCtaBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const t = useTranslation();
  const { href } = useLanguage();

  const card = (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease }}
      className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#FFB800] via-orange to-[#E84D00] p-8 sm:p-10 md:p-12 shadow-[0_24px_60px_rgba(255,92,0,0.35),0_8px_0_rgba(13,13,13,0.15)] border border-white/10"
    >
      <div
        className="pointer-events-none absolute -top-16 -end-16 h-56 w-56 rounded-full bg-white/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -start-12 h-48 w-48 rounded-full bg-[#FFB800]/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/10"
        aria-hidden
      />

      <div className="relative grid grid-cols-1 md:grid-cols-[minmax(220px,300px)_1fr] gap-8 md:gap-10 lg:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="flex items-center justify-center md:justify-start order-2 md:order-1"
        >
          <ConsultationBannerIllustration />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          className="flex flex-col justify-center text-center md:text-start gap-4 md:gap-5 order-1 md:order-2"
        >
          <h2 className="type-course-section-heading font-dm font-bold text-background leading-tight">
            {t.bookcall.heading}
          </h2>
          <p className="type-section-body font-dm text-background/90 leading-relaxed max-w-xl mx-auto md:mx-0">
            {t.bookcall.sub}
          </p>
          <Link
            href={href(CONSULTATION_BASE_PATH)}
            className="inline-flex items-center justify-center self-center md:self-start font-dm font-semibold px-8 py-3.5 text-sm bg-background text-cream rounded-full hover:bg-background/90 transition-colors duration-200 shadow-[0_10px_24px_rgba(13,13,13,0.35)]"
          >
            {t.bookcall.cta}
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );

  if (embedded) {
    return <div className={className}>{card}</div>;
  }

  return (
    <section className={`bg-background py-16 md:py-20 ${className}`}>
      <div className="max-w-6xl mx-auto px-8 md:px-12 lg:px-16">{card}</div>
    </section>
  );
}
