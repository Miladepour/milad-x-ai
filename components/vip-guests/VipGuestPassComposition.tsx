"use client";

import { motion, useReducedMotion } from "framer-motion";
import VipGuestInvitationMessage from "./VipGuestInvitationMessage";
import VipGuestPassBackground from "./VipGuestPassBackground";
import VipGuestPassScene, { VipGuestPassAssembly } from "./VipGuestPassScene";
import type { VipGuestBadgeData } from "./VipGuestBadgeCard";

export type VipPassCompositionLayout = "page" | "story-export" | "badge-export";

interface VipGuestPassCompositionProps {
  data: VipGuestBadgeData;
  layout?: VipPassCompositionLayout;
  animate?: boolean;
  className?: string;
  exportId?: string;
}

export default function VipGuestPassComposition({
  data,
  layout = "page",
  animate = false,
  className = "",
  exportId,
}: VipGuestPassCompositionProps) {
  const reduceMotion = useReducedMotion();

  if (layout === "story-export") {
    return (
      <div
        id={exportId}
        className={`relative flex flex-col items-center overflow-hidden ${className}`}
        style={{ width: 1080, height: 1920 }}
      >
        <VipGuestPassBackground />
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-12 py-16">
          <VipGuestPassAssembly data={data} swing={false} size="export-story" />
          <div className="mt-16 w-full max-w-[920px]">
            <VipGuestInvitationMessage data={data} size="export" />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "badge-export") {
    return (
      <div
        id={exportId}
        className={`relative flex flex-col items-center overflow-hidden ${className}`}
        style={{ width: 1080, height: 1350 }}
      >
        <VipGuestPassBackground />
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-12 py-10">
          <VipGuestPassAssembly data={data} swing={false} size="export-badge" />
          <div className="mt-10 w-full max-w-[900px]">
            <VipGuestInvitationMessage data={data} size="export-post" />
          </div>
        </div>
      </div>
    );
  }

  const shouldAnimate = animate && !reduceMotion;

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <VipGuestPassScene data={data} animate={animate} size="page" />
      <motion.div
        className="mt-10 px-2"
        initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
        transition={{ delay: 1.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <VipGuestInvitationMessage data={data} size="page" />
      </motion.div>
    </div>
  );
}
