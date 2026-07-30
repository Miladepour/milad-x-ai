import { toPng } from "html-to-image";
import {
  CERTIFICATE_CAPTURE_PIXEL_RATIO,
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

async function preloadFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts?.ready) return;
  try {
    await document.fonts.ready;
  } catch {
    // Continue export even if font loading fails.
  }
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

/**
 * Safari crops/shifts off-screen nodes (left:-9999px). Stage the capture target
 * at (0,0) inside a zero-size clipped host so it rasterizes correctly without
 * covering the visible page.
 */
function stageElementForCapture(element: HTMLElement): () => void {
  const parent = element.parentElement;
  const nextSibling = element.nextSibling;

  const stage = document.createElement("div");
  stage.setAttribute("data-certificate-capture-stage", "true");
  stage.style.cssText = [
    "position:fixed",
    "left:0",
    "top:0",
    "width:0",
    "height:0",
    "overflow:hidden",
    "opacity:0",
    "pointer-events:none",
    "z-index:-9999",
  ].join(";");

  const previous = {
    position: element.style.position,
    left: element.style.left,
    top: element.style.top,
    right: element.style.right,
    bottom: element.style.bottom,
    transform: element.style.transform,
    margin: element.style.margin,
    inset: element.style.inset,
  };

  document.body.appendChild(stage);
  stage.appendChild(element);

  element.style.position = "relative";
  element.style.left = "0";
  element.style.top = "0";
  element.style.right = "auto";
  element.style.bottom = "auto";
  element.style.transform = "none";
  element.style.margin = "0";

  return () => {
    element.style.position = previous.position;
    element.style.left = previous.left;
    element.style.top = previous.top;
    element.style.right = previous.right;
    element.style.bottom = previous.bottom;
    element.style.transform = previous.transform;
    element.style.margin = previous.margin;
    element.style.inset = previous.inset;

    if (parent) {
      parent.insertBefore(element, nextSibling);
    }
    stage.remove();
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

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    return true;
  }
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function resolveCapturePixelRatio(format: CertificateFormat): number {
  const base = CERTIFICATE_CAPTURE_PIXEL_RATIO[format];
  if (!isMobileDevice()) return base;
  // Keep quality readable on phones without OOMing Safari.
  return Math.min(base, format === "document" ? 2 : 2);
}

const CAPTURE_TIMEOUT_MS = 25_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error("Image capture timed out"));
    }, ms);
    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export async function captureCertificatePng(
  format: CertificateFormat = "document"
): Promise<string> {
  const element = document.getElementById(getCertificateElementId(format));
  if (!element) {
    throw new Error(`Certificate not found (${format})`);
  }

  const { width, height } = getCertificateDimensions(format);

  await Promise.all([preloadFonts(), preloadImages(element)]);
  const unstage = stageElementForCapture(element);
  const restoreStyles = prepareCertificateForExport(element);
  const restoreImages = await inlineImagesForExport(element);

  try {
    await waitForPaint();
    return await withTimeout(
      toPng(element, {
        cacheBust: true,
        pixelRatio: resolveCapturePixelRatio(format),
        width,
        height,
        canvasWidth: width,
        canvasHeight: height,
        backgroundColor: "#0D0D0D",
        skipFonts: false,
        style: {
          transform: "none",
          left: "0",
          top: "0",
          margin: "0",
        },
      }),
      CAPTURE_TIMEOUT_MS
    );
  } finally {
    restoreImages();
    restoreStyles();
    unstage();
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
