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
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const update = () => {
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

  return (
    <div
      ref={hostRef}
      className="certificate-preview-host relative mx-auto w-full min-w-0 max-w-[960px] overflow-hidden"
      style={{ height: CERTIFICATE_HEIGHT * scale }}
    >
      {/* Absolute so the 960px certificate never expands the page column. */}
      <div
        className="certificate-preview-scaler absolute left-0 top-0"
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
  );
}
