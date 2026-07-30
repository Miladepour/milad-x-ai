"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import {
  blobFromDataUrl,
  captureCertificatePng,
} from "@/lib/members/certificate-capture";
import type { CertificateFormat } from "@/lib/members/certificate-layout";

interface CertificateDownloadButtonsProps {
  certificateNumber: string;
  labels: {
    downloadPng: string;
    downloadPdf: string;
    downloadStory: string;
    downloadPost: string;
    downloadSocialHeading: string;
    downloadSocialMention: string;
    downloading: string;
  };
}

type BusyFormat = CertificateFormat | "pdf" | null;

/** Phones/tablets only — never treat desktop Chrome as mobile just because canShare exists. */
function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return true;
  }
  // iPadOS 13+ reports as MacIntel with touch
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function isIosLike(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

function openBlobInNewTab(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function ensureBlobType(blob: Blob, filename: string): Blob {
  if (blob.type) return blob;
  if (filename.toLowerCase().endsWith(".pdf")) {
    return new Blob([blob], { type: "application/pdf" });
  }
  if (filename.toLowerCase().endsWith(".png")) {
    return new Blob([blob], { type: "image/png" });
  }
  return blob;
}

/**
 * Mobile-only save.
 * - PNG: share sheet (Save Image) when available
 * - PDF: share → Save to Files when available; otherwise open/download fallbacks
 * Never used on desktop.
 */
async function saveOnMobile(blob: Blob, filename: string): Promise<void> {
  const typed = ensureBlobType(blob, filename);
  const file = new File([typed], filename, {
    type: typed.type || "application/octet-stream",
  });
  const isPdf = filename.toLowerCase().endsWith(".pdf");

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
    }
  }

  // Android / some browsers: trigger a real download.
  downloadBlob(typed, filename);

  // iOS often ignores <a download>, especially for PDF — open so the user can
  // use Share → Save to Files from the system viewer.
  if (isIosLike() || isPdf) {
    window.setTimeout(() => openBlobInNewTab(typed), 250);
  }
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function renderSocialMention(text: string) {
  const handle = "@mxaiacademy";
  if (!text.includes(handle)) {
    return text;
  }

  const parts = text.split(handle);
  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 ? (
        <span className="font-medium text-orange">{handle}</span>
      ) : null}
    </span>
  ));
}

function CertificateSocialPlatformIcons() {
  const iconWrapClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-cream/70";

  return (
    <div
      className="mb-4 flex items-center justify-center gap-3"
      aria-label="Instagram, Facebook, LinkedIn"
    >
      <span className={iconWrapClass} title="Instagram">
        <IconInstagram />
      </span>
      <span className={iconWrapClass} title="Facebook">
        <IconFacebook />
      </span>
      <span className={iconWrapClass} title="LinkedIn">
        <IconLinkedIn />
      </span>
    </div>
  );
}

export default function CertificateDownloadButtons({
  certificateNumber,
  labels,
}: CertificateDownloadButtonsProps) {
  const [busy, setBusy] = useState<BusyFormat>(null);
  const [error, setError] = useState("");

  async function downloadPng(format: CertificateFormat) {
    setError("");
    setBusy(format);
    try {
      const dataUrl = await captureCertificatePng(format);
      const suffix =
        format === "document" ? "" : format === "story" ? "-story" : "-post";
      const filename = `${certificateNumber}${suffix}.png`;

      if (isMobileDevice()) {
        await saveOnMobile(blobFromDataUrl(dataUrl), filename);
      } else {
        // Desktop: direct download only — never open the OS share sheet.
        downloadDataUrl(dataUrl, filename);
      }
    } catch {
      setError("Could not save PNG. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function downloadPdf() {
    setError("");
    setBusy("pdf");
    try {
      const dataUrl = await captureCertificatePng("document");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, 297, 210);
      const filename = `${certificateNumber}.pdf`;

      if (isMobileDevice()) {
        // Ensure PDF MIME type — some WebViews omit it from jsPDF output("blob").
        const pdfBlob = new Blob([pdf.output("arraybuffer")], {
          type: "application/pdf",
        });
        await saveOnMobile(pdfBlob, filename);
      } else {
        // Desktop: original jsPDF save path.
        pdf.save(filename);
      }
    } catch {
      setError("Could not save PDF. Try again.");
    } finally {
      setBusy(null);
    }
  }

  const buttonClass =
    "rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-cream transition-colors hover:border-orange/50 hover:text-orange disabled:opacity-50";

  const socialButtonClass =
    "rounded-full border border-orange/35 bg-orange/[0.08] px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-orange transition-colors hover:border-orange hover:bg-orange/15 disabled:opacity-50";

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => void downloadPng("document")}
          disabled={busy !== null}
          className={buttonClass}
        >
          {busy === "document" ? labels.downloading : labels.downloadPng}
        </button>
        <button
          type="button"
          onClick={() => void downloadPdf()}
          disabled={busy !== null}
          className={buttonClass}
        >
          {busy === "pdf" ? labels.downloading : labels.downloadPdf}
        </button>
      </div>

      <div className="w-full border-t border-white/[0.08] pt-4">
        <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-cream/45">
          {labels.downloadSocialHeading}
        </p>

        <CertificateSocialPlatformIcons />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => void downloadPng("story")}
            disabled={busy !== null}
            className={socialButtonClass}
          >
            {busy === "story" ? labels.downloading : labels.downloadStory}
          </button>
          <button
            type="button"
            onClick={() => void downloadPng("post")}
            disabled={busy !== null}
            className={socialButtonClass}
          >
            {busy === "post" ? labels.downloading : labels.downloadPost}
          </button>
        </div>

        <p className="mt-4 text-center font-dm text-sm leading-relaxed text-cream/60">
          {renderSocialMention(labels.downloadSocialMention)}
        </p>
      </div>

      {error ? (
        <p className="font-dm text-sm text-orange" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
