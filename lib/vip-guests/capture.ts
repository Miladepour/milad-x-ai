import { toPng } from "html-to-image";
import { VIP_PASS_BACKGROUND } from "@/lib/vip-guests/copy";
import {
  getVipPassDimensions,
  getVipPassElementId,
  type VipPassFormat,
} from "@/lib/vip-guests/layout";

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

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(blob);
  });
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

function prepareForExport(element: HTMLElement) {
  const previous = {
    boxShadow: element.style.boxShadow,
    overflow: element.style.overflow,
  };

  element.style.boxShadow = "none";
  element.style.overflow = "hidden";

  element.querySelectorAll<HTMLElement>(".certificate-noise-overlay").forEach((node) => {
    node.dataset.exportMixBlend = node.style.mixBlendMode;
    node.style.mixBlendMode = "normal";
    node.style.opacity = node.dataset.exportNoiseOpacity ?? "0.16";
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

const CAPTURE_TIMEOUT_MS = 20_000;

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

export async function captureVipPassPng(format: VipPassFormat = "story"): Promise<string> {
  const element = document.getElementById(getVipPassElementId(format));
  if (!element) {
    throw new Error(`VIP pass not found (${format})`);
  }

  const { width, height } = getVipPassDimensions(format);

  await preloadImages(element);
  const restoreStyles = prepareForExport(element);
  const restoreImages = await inlineImagesForExport(element);

  try {
    return await withTimeout(
      toPng(element, {
        cacheBust: true,
        pixelRatio: 1,
        width,
        height,
        backgroundColor: VIP_PASS_BACKGROUND,
        skipFonts: true,
      }),
      CAPTURE_TIMEOUT_MS
    );
  } finally {
    restoreImages();
    restoreStyles();
  }
}

export async function captureVipPassPngBlob(format: VipPassFormat = "story"): Promise<Blob> {
  const dataUrl = await captureVipPassPng(format);
  return dataUrlToBlob(dataUrl);
}
