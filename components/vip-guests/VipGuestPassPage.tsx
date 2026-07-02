"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import VipGuestDownloadButtons from "./VipGuestDownloadButtons";
import VipGuestPassBackground from "./VipGuestPassBackground";
import VipGuestPassComposition from "./VipGuestPassComposition";
import type { VipGuestInvite } from "@/lib/vip-guests/types";
import { getVipPassElementId } from "@/lib/vip-guests/layout";

interface VipGuestPassPageProps {
  invite: VipGuestInvite;
}

const headerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function VipGuestPassPage({ invite }: VipGuestPassPageProps) {
  const [ready, setReady] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const isFa = invite.locale === "FA";

  const badgeData = {
    fullName: invite.fullName,
    guestTitle: invite.guestTitle,
    eventTitle: invite.eventTitle,
    eventDate: invite.eventDate,
    locale: invite.locale,
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 2800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen">
      <VipGuestPassBackground className="fixed inset-0 -z-10" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center px-4 py-8 sm:py-12">
        <motion.div
          className="mb-8 text-center"
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          transition={{ staggerChildren: 0.14, delayChildren: 0.15 }}
        >
          <motion.p
            variants={headerItem}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange"
          >
            {isFa ? "دعوت ویژه" : "VIP invitation"}
          </motion.p>
          <motion.h1
            variants={headerItem}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 font-dm text-2xl font-semibold text-cream sm:text-3xl"
          >
            {isFa ? `خوش آمدید، ${invite.fullName}` : `Welcome, ${invite.fullName}`}
          </motion.h1>
          <motion.p
            variants={headerItem}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-3 max-w-md font-dm text-sm text-cream/65"
          >
            {isFa
              ? "کارت VIP اختصاصی شما آماده است. آن را دانلود کنید و در استوری خود به اشتراک بگذارید."
              : "Your personal VIP pass is ready. Download it and share it on your story."}
          </motion.p>
        </motion.div>

        <div className="mb-10 w-full">
          <VipGuestPassComposition data={badgeData} layout="page" animate />
        </div>

        <div
          className={`transition-opacity duration-700 ${ready ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <VipGuestDownloadButtons
            fullName={invite.fullName}
            locale={invite.locale}
            onError={setDownloadError}
          />
          {downloadError && (
            <p className="mt-3 text-center font-dm text-sm text-red-300">{downloadError}</p>
          )}
        </div>

        {/* Off-screen export targets — must stay rendered (no opacity:0) for html-to-image */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[-9999px] top-0 overflow-visible"
        >
          <VipGuestPassComposition
            data={badgeData}
            layout="story-export"
            exportId={getVipPassElementId("story")}
          />
          <VipGuestPassComposition
            data={badgeData}
            layout="badge-export"
            exportId={getVipPassElementId("badge")}
          />
        </div>
      </div>
    </div>
  );
}
