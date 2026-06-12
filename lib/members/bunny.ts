const BUNNY_HOST_RE = /(?:mediadelivery\.net|\.b-cdn\.net|video\.bunnycdn\.com)/i;
const VIDEO_GUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function isBunnyUrl(url: string): boolean {
  const trimmed = url.trim();
  if (BUNNY_HOST_RE.test(trimmed)) return true;
  return VIDEO_GUID_RE.test(trimmed) && !trimmed.includes("://");
}

export interface BunnyVideoRef {
  libraryId: string;
  videoId: string;
}

/** Parse library + video IDs from Bunny embed, play, HLS, or MP4 URLs. */
export function parseBunnyVideo(
  url: string,
  libraryIdFallback?: string
): BunnyVideoRef | null {
  const trimmed = url.trim();

  const mediaMatch = trimmed.match(
    /mediadelivery\.net\/(?:embed|play)\/(\d+)\/([0-9a-f-]{36})/i
  );
  if (mediaMatch) {
    return { libraryId: mediaMatch[1], videoId: mediaMatch[2] };
  }

  const cdnMatch = trimmed.match(/\.b-cdn\.net\/([0-9a-f-]{36})(?:\/|$)/i);
  if (cdnMatch && libraryIdFallback) {
    return { libraryId: libraryIdFallback, videoId: cdnMatch[1] };
  }

  if (VIDEO_GUID_RE.test(trimmed) && !trimmed.includes("://") && libraryIdFallback) {
    const videoId = trimmed.match(VIDEO_GUID_RE)?.[0];
    if (videoId) return { libraryId: libraryIdFallback, videoId };
  }

  return null;
}

export function bunnyEmbedBaseUrl(ref: BunnyVideoRef): string {
  return `https://iframe.mediadelivery.net/embed/${ref.libraryId}/${ref.videoId}`;
}
