"use client";

import { useEffect, useRef, useState } from "react";
import { getCertificateDimensions } from "@/lib/members/certificate-layout";

interface CertificatePreviewFrameProps {
  children: React.ReactNode;
}

const { width: CERTIFICATE_WIDTH, height: CERTIFICATE_HEIGHT } =
  getCertificateDimensions("document");

function initialScale(): number {
  if (typeof window === "undefined") return 1;
  const available = Math.max(window.innerWidth - 32, 1);
  return Math.min(1, available / CERTIFICATE_WIDTH);
}

export default function CertificatePreviewFrame({
  children,
}: CertificatePreviewFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initialScale);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const available = el.clientWidth;
      // Ignore zero-width frames (common during mobile layout) so we never scale(0).
      if (available <= 0) return;
      setScale(Math.min(1, available / CERTIFICATE_WIDTH));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("orientationchange", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  const scaledWidth = CERTIFICATE_WIDTH * scale;
  const scaledHeight = CERTIFICATE_HEIGHT * scale;

  return (
    <div ref={containerRef} className="certificate-preview-host mx-auto w-full max-w-[960px]">
      <div
        className="certificate-preview-scaler mx-auto overflow-hidden"
        style={{ width: scaledWidth, height: scaledHeight }}
      >
        <div
          style={{
            width: CERTIFICATE_WIDTH,
            height: CERTIFICATE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
