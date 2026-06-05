"use client";

import Lottie from "lottie-react";
import customerAssistantAnimation from "@/public/lottie/customer-assistant.json";

/** Animated consultation assistant for CTA banners. */
export default function ConsultationBannerIllustration() {
  return (
    <div
      className="relative w-full max-w-[240px] sm:max-w-[280px] md:max-w-[300px] mx-auto md:mx-0"
      aria-hidden
    >
      <div
        className="absolute inset-6 rounded-full bg-background/25 blur-2xl"
        aria-hidden
      />
      <div
        className="relative [transform:perspective(900px)_rotateY(-10deg)_rotateX(6deg)] md:[transform:perspective(900px)_rotateY(-14deg)_rotateX(8deg)] transition-transform duration-500 hover:[transform:perspective(900px)_rotateY(-6deg)_rotateX(4deg)_scale(1.02)]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Lottie
          animationData={customerAssistantAnimation}
          loop
          className="w-full h-auto drop-shadow-[0_20px_40px_rgba(13,13,13,0.45)]"
        />
      </div>
    </div>
  );
}
