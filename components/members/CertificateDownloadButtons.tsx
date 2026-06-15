"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { captureCertificatePng } from "@/lib/members/certificate-capture";

interface CertificateDownloadButtonsProps {
  certificateNumber: string;
  labels: {
    downloadPng: string;
    downloadPdf: string;
    downloading: string;
  };
}

export default function CertificateDownloadButtons({
  certificateNumber,
  labels,
}: CertificateDownloadButtonsProps) {
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);
  const [error, setError] = useState("");

  async function downloadPng() {
    setError("");
    setBusy("png");
    try {
      const dataUrl = await captureCertificatePng();
      const link = document.createElement("a");
      link.download = `${certificateNumber}.png`;
      link.href = dataUrl;
      link.click();
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
      const dataUrl = await captureCertificatePng();
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, 297, 210);
      pdf.save(`${certificateNumber}.pdf`);
    } catch {
      setError("Could not save PDF. Try again.");
    } finally {
      setBusy(null);
    }
  }

  const buttonClass =
    "rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-cream transition-colors hover:border-orange/50 hover:text-orange disabled:opacity-50";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => void downloadPng()}
          disabled={busy !== null}
          className={buttonClass}
        >
          {busy === "png" ? labels.downloading : labels.downloadPng}
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
      {error ? (
        <p className="font-dm text-sm text-orange" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
