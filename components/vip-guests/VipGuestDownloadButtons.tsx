"use client";

import { useState } from "react";
import { captureVipPassPng, captureVipPassPngBlob } from "@/lib/vip-guests/capture";
import type { VipPassFormat } from "@/lib/vip-guests/layout";

interface VipGuestDownloadButtonsProps {
  fullName: string;
  locale: "EN" | "FA";
  onError?: (message: string | null) => void;
}

type BusyFormat = VipPassFormat | null;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function slugifyName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "vip-pass";
}

export default function VipGuestDownloadButtons({
  fullName,
  locale,
  onError,
}: VipGuestDownloadButtonsProps) {
  const [busy, setBusy] = useState<BusyFormat>(null);
  const isFa = locale === "FA";
  const slug = slugifyName(fullName);

  async function handleDownload(format: VipPassFormat) {
    setBusy(format);
    onError?.(null);
    try {
      const blob = await captureVipPassPngBlob(format);
      const suffix = format === "story" ? "story" : "badge";
      downloadBlob(blob, `mxai-vip-${slug}-${suffix}.png`);
    } catch (err) {
      console.error("[vip-pass download]", err);
      onError?.(
        isFa
          ? "دانلود انجام نشد. دوباره تلاش کنید."
          : "Download failed. Please try again."
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    setBusy("story");
    try {
      const blob = await captureVipPassPngBlob("story");
      const file = new File([blob], `mxai-vip-${slug}-story.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: isFa ? "کارت VIP من" : "My VIP pass",
        });
        return;
      }

      const dataUrl = await captureVipPassPng("story");
      const linkBlob = await fetch(dataUrl).then((r) => r.blob());
      downloadBlob(linkBlob, `mxai-vip-${slug}-story.png`);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("[vip-pass share]", err);
        onError?.(
          isFa
            ? "اشتراک‌گذاری انجام نشد. دوباره تلاش کنید."
            : "Share failed. Please try again."
        );
      }
    } finally {
      setBusy(null);
    }
  }

  const btnClass =
    "rounded-full border border-orange/50 px-5 py-3 font-mono text-xs uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background disabled:cursor-not-allowed disabled:opacity-50";

  const btnPrimary =
    "rounded-full bg-orange px-5 py-3 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => void handleDownload("story")}
          disabled={busy !== null}
          className={btnPrimary}
        >
          {busy === "story"
            ? isFa
              ? "در حال آماده‌سازی…"
              : "Preparing…"
            : isFa
              ? "دانلود برای استوری"
              : "Download for story"}
        </button>
        <button
          type="button"
          onClick={() => void handleDownload("badge")}
          disabled={busy !== null}
          className={btnClass}
        >
          {busy === "badge"
            ? isFa
              ? "در حال آماده‌سازی…"
              : "Preparing…"
            : isFa
              ? "دانلود کارت"
              : "Download badge"}
        </button>
      </div>
      <button
        type="button"
        onClick={() => void handleShare()}
        disabled={busy !== null}
        className={btnClass}
      >
        {isFa ? "اشتراک‌گذاری" : "Share"}
      </button>
      <p className="max-w-xs text-center font-dm text-xs text-cream/50">
        {isFa
          ? "تصویر را در استوری اینستاگرام یا لینکدین به اشتراک بگذارید."
          : "Share your pass on Instagram Stories or LinkedIn."}
      </p>
    </div>
  );
}
