import { createHash } from "crypto";
import {
  bunnyEmbedBaseUrl,
  parseBunnyVideo,
  type BunnyVideoRef,
} from "@/lib/members/bunny";

function signEmbedToken(
  tokenKey: string,
  videoId: string,
  expires: number
): string {
  return createHash("sha256")
    .update(tokenKey + videoId + expires)
    .digest("hex");
}

export interface BunnyEmbedOptions {
  autoplay?: boolean;
  preload?: boolean;
}

function withEmbedPlayerParams(url: string, opts: BunnyEmbedOptions): string {
  const parsed = new URL(url);
  parsed.searchParams.set("autoplay", opts.autoplay ? "true" : "false");
  parsed.searchParams.set("preload", opts.preload ? "true" : "false");
  return parsed.toString();
}

export function buildBunnyEmbedUrl(
  videoUrl: string,
  opts: BunnyEmbedOptions = {}
): string | null {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID?.trim();
  const ref = parseBunnyVideo(videoUrl, libraryId);
  if (!ref) return null;

  const autoplay = opts.autoplay === true;
  const preload = opts.preload === true;

  const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY?.trim();
  let base = bunnyEmbedBaseUrl(ref);
  if (tokenKey) {
    const expires = Math.floor(Date.now() / 1000) + 60 * 60;
    const token = signEmbedToken(tokenKey, ref.videoId, expires);
    base = `${base}?token=${token}&expires=${expires}`;
  }

  return withEmbedPlayerParams(base, { autoplay, preload });
}

export function getBunnyLibraryId(): string | undefined {
  return process.env.BUNNY_STREAM_LIBRARY_ID?.trim() || undefined;
}

export type { BunnyVideoRef };
