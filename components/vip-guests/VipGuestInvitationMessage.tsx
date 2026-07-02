import { buildVipInvitationMessage } from "@/lib/vip-guests/copy";
import type { VipGuestBadgeData } from "./VipGuestBadgeCard";

interface VipGuestInvitationMessageProps {
  data: VipGuestBadgeData;
  size?: "page" | "export" | "export-post";
  className?: string;
}

function Flourish({ scale = 1 }: { scale?: number }) {
  return (
    <div aria-hidden className="flex items-center justify-center gap-3" style={{ transform: `scale(${scale})` }}>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-orange/60" />
      <span className="h-1.5 w-1.5 rotate-45 border border-orange/70" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-orange/60" />
    </div>
  );
}

export default function VipGuestInvitationMessage({
  data,
  size = "page",
  className = "",
}: VipGuestInvitationMessageProps) {
  const isFa = data.locale === "FA";
  const message = buildVipInvitationMessage({
    fullName: data.fullName,
    eventTitle: data.eventTitle,
    eventDate: data.eventDate,
    locale: data.locale,
  });

  const isExport = size === "export";
  const isExportPost = size === "export-post";
  const isLargeExport = isExport || isExportPost;

  const greetingSize = isExport ? 40 : isExportPost ? 32 : 17;
  const bodySize = isExport ? 30 : isExportPost ? 24 : 14;
  const signatureSize = isExport ? 26 : isExportPost ? 22 : 12;
  const maxWidth = isExport ? 920 : isExportPost ? 880 : 380;
  const flourishScale = isExport ? 2 : isExportPost ? 1.6 : 1;
  const greetingMarginTop = isExport ? 40 : isExportPost ? 28 : 20;
  const bodyMarginTop = isExport ? 28 : isExportPost ? 20 : 14;
  const signatureMarginTop = isExport ? 48 : isExportPost ? 32 : 24;

  return (
    <div
      className={`mx-auto text-center font-dm text-cream/90 ${className}`}
      dir={isFa ? "rtl" : "ltr"}
      style={{
        maxWidth,
        fontSize: isLargeExport ? bodySize : 15,
        lineHeight: isLargeExport ? 1.5 : 1.65,
      }}
    >
      <Flourish scale={flourishScale} />

      <p
        className="font-semibold text-cream"
        style={{
          fontSize: greetingSize,
          marginTop: greetingMarginTop,
          letterSpacing: "0.01em",
        }}
      >
        {message.greeting}
      </p>
      <p
        className="whitespace-pre-line text-cream/75"
        style={{ fontSize: bodySize, marginTop: bodyMarginTop }}
      >
        {message.body}
      </p>

      <div style={{ marginTop: signatureMarginTop }}>
        <p
          className="font-mono uppercase tracking-[0.3em] text-orange"
          style={{ fontSize: signatureSize }}
        >
          {message.signature}
        </p>
      </div>
    </div>
  );
}
