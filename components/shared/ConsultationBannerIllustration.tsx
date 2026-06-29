"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import customerAssistantAnimation from "@/public/lottie/customer-assistant.json";

const shellClass =
  "relative w-full max-w-[240px] sm:max-w-[280px] md:max-w-[300px] mx-auto md:mx-0 min-h-[200px] sm:min-h-[220px]";

/** Animated consultation assistant for CTA banners (client-only to avoid hydration mismatch). */
export default function ConsultationBannerIllustration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={shellClass} aria-hidden />;
  }

  return (
    <div className={shellClass} aria-hidden>
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
