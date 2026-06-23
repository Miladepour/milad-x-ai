import { toPng } from "html-to-image";
import {
  type CertificateFormat,
  getCertificateDimensions,
  getCertificateElementId,
} from "@/lib/members/certificate-layout";

async function preloadImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        })
    )
  );
}

function prepareCertificateForExport(element: HTMLElement) {
  const previous = {
    boxShadow: element.style.boxShadow,
    overflow: element.style.overflow,
  };

  element.style.boxShadow = "none";
  element.style.overflow = "hidden";

  element.querySelectorAll<HTMLElement>(".certificate-noise-overlay").forEach((node) => {
    node.dataset.exportMixBlend = node.style.mixBlendMode;
    node.style.mixBlendMode = "normal";
    node.style.opacity = "0.14";
  });

  return () => {
    element.style.boxShadow = previous.boxShadow;
    element.style.overflow = previous.overflow;
    element.querySelectorAll<HTMLElement>(".certificate-noise-overlay").forEach((node) => {
      node.style.mixBlendMode = node.dataset.exportMixBlend ?? "";
      node.style.opacity = "";
      delete node.dataset.exportMixBlend;
    });
  };
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function captureCertificatePng(
  format: CertificateFormat = "document"
): Promise<string> {
  const element = document.getElementById(getCertificateElementId(format));
  if (!element) {
    throw new Error(`Certificate not found (${format})`);
  }

  const { width, height } = getCertificateDimensions(format);

  await preloadImages(element);
  const restore = prepareCertificateForExport(element);

  try {
    return await toPng(element, {
      cacheBust: true,
      pixelRatio: 1,
      width,
      height,
      backgroundColor: "#0D0D0D",
      skipFonts: true,
      style: {
        transform: "none",
      },
    });
  } finally {
    restore();
  }
}

export async function captureCertificatePngBlob(
  format: CertificateFormat = "document"
): Promise<Blob> {
  const dataUrl = await captureCertificatePng(format);
  return dataUrlToBlob(dataUrl);
}

export function blobFromDataUrl(dataUrl: string): Blob {
  return dataUrlToBlob(dataUrl);
}
