"use client";

import Lottie from "lottie-react";
import aiMindAnimation from "@/public/lottie/geometric-ai-mind.json";

/** Animated geometric AI mind illustration for the tutorials CTA banner. */
export default function AiLearnIllustration() {
  return (
    <div className="relative w-full max-w-[220px] sm:max-w-[240px] md:max-w-[260px]" aria-hidden>
      <Lottie
        animationData={aiMindAnimation}
        loop
        className="w-full h-auto drop-shadow-[0_12px_28px_rgba(13,13,13,0.25)]"
      />
    </div>
  );
}
