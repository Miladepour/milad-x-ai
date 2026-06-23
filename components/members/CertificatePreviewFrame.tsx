"use client";

import { useEffect, useRef, useState } from "react";
import {
  getCertificateDimensions,
} from "@/lib/members/certificate-layout";

interface CertificatePreviewFrameProps {
  children: React.ReactNode;
}

const { width: CERTIFICATE_WIDTH, height: CERTIFICATE_HEIGHT } =
  getCertificateDimensions("document");

export default function CertificatePreviewFrame({
  children,
}: CertificatePreviewFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const available = el.clientWidth;
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
    <div ref={containerRef} className="w-full overflow-hidden">
      <div
        className="mx-auto"
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
