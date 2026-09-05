"use client";

import Image from "next/image";
import { hasCourseCover } from "@/lib/courses/openable";

const PLACEHOLDER_TONES = [
  "from-orange/25 via-background to-surface",
  "from-orange/10 via-surface to-background",
  "from-surface via-background to-orange/20",
  "from-orange/15 via-[#1a1510] to-background",
  "from-[#241810] via-background to-orange/15",
  "from-background via-surface to-orange/25",
];

function toneFor(seed: string): string {
  let hash = 0;
  for (const ch of seed) hash = (hash + ch.charCodeAt(0)) % PLACEHOLDER_TONES.length;
  return PLACEHOLDER_TONES[hash] ?? PLACEHOLDER_TONES[0]!;
}

function publicImageSrc(src: string): string {
  return src
    .split("/")
    .map((segment, index) => (index === 0 ? segment : encodeURIComponent(segment)))
    .join("/");
}

interface CourseCoverImageProps {
  src: string;
  alt: string;
  sizes: string;
  seed?: string;
  className?: string;
}

export default function CourseCoverImage({
  src,
  alt,
  sizes,
  seed = alt,
  className = "object-cover",
}: CourseCoverImageProps) {
  if (!hasCourseCover(src)) {
    return (
      <div
        className={`absolute inset-0 bg-gradient-to-br ${toneFor(seed)}`}
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={publicImageSrc(src)}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      unoptimized={src.startsWith("http")}
    />
  );
}
