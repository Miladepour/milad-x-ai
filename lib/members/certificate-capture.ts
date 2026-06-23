import { toPng } from "html-to-image";
import {
  type CertificateFormat,
  getCertificateDimensions,
  getCertificateElementId,
} from "@/lib/members/certificate-layout";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(blob);
  });
}

async function preloadImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (!img.getAttribute("crossorigin")) {
            img.crossOrigin = "anonymous";
          }
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

async function inlineImagesForExport(root: HTMLElement): Promise<() => void> {
  const images = Array.from(root.querySelectorAll("img"));
  const restores: Array<() => void> = [];

  await Promise.all(
    images.map(async (img) => {
      const src = img.currentSrc || img.src;
      if (!src || src.startsWith("data:")) return;

      try {
        const response = await fetch(src, { credentials: "same-origin" });
        if (!response.ok) return;
        const dataUrl = await blobToDataUrl(await response.blob());
        const previous = img.src;
        img.src = dataUrl;
        restores.push(() => {
          img.src = previous;
        });
      } catch {
        // Keep original src if inlining fails.
      }
    })
  );

  return () => {
    restores.forEach((restore) => restore());
  };
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
  const restoreStyles = prepareCertificateForExport(element);
  const restoreImages = await inlineImagesForExport(element);

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
    restoreImages();
    restoreStyles();
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
