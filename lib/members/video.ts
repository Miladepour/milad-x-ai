export function isYoutubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

export function isVimeoUrl(url: string): boolean {
  return /vimeo\.com/i.test(url);
}

export function youtubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    const id = u.searchParams.get("v");
    return id || null;
  } catch {
    return null;
  }
}

export function youtubeEmbedUrl(
  url: string,
  opts?: { enableJsApi?: boolean; origin?: string }
): string | null {
  const id = youtubeVideoId(url);
  if (!id) return null;

  const params = new URLSearchParams();
  params.set("rel", "0");
  if (opts?.enableJsApi) {
    params.set("enablejsapi", "1");
    if (opts.origin) params.set("origin", opts.origin);
  }

  const qs = params.toString();
  return `https://www.youtube-nocookie.com/embed/${id}${qs ? `?${qs}` : ""}`;
}

export function vimeoEmbedUrl(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return match?.[1] ? `https://player.vimeo.com/video/${match[1]}` : null;
}
