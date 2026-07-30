"use client";

import { useEffect, useRef, useState } from "react";
import { getCertificateDimensions } from "@/lib/members/certificate-layout";

interface CertificatePreviewFrameProps {
  children: React.ReactNode;
}

const { width: CERTIFICATE_WIDTH, height: CERTIFICATE_HEIGHT } =
  getCertificateDimensions("document");

export default function CertificatePreviewFrame({
  children,
}: CertificatePreviewFrameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  // Stay unset until measured so SSR/first paint never locks in a full-size (960px) layout.
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const update = () => {
      // Measure the host's laid-out width. Host is width:100% + min-w-0 and has no
      // intrinsic large children contributing to width, so it follows the page column.
      const available = host.getBoundingClientRect().width;
      if (available <= 1) return;
      setScale(Math.min(1, available / CERTIFICATE_WIDTH));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(host);
    window.addEventListener("orientationchange", update);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const resolvedScale = scale ?? 0;
  const scaledHeight = CERTIFICATE_HEIGHT * resolvedScale;

  return (
    <div
      ref={hostRef}
      className="certificate-preview-host mx-auto w-full min-w-0 max-w-[960px] overflow-hidden"
      style={{
        // Reserve aspect ratio before measure so layout doesn't jump wildly.
        aspectRatio: scale === null ? `${CERTIFICATE_WIDTH} / ${CERTIFICATE_HEIGHT}` : undefined,
        height: scale === null ? undefined : scaledHeight,
      }}
    >
      {scale === null ? null : (
        <div
          className="certificate-preview-scaler"
          style={{
            width: CERTIFICATE_WIDTH,
            height: CERTIFICATE_HEIGHT,
            transform: `scale(${resolvedScale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
