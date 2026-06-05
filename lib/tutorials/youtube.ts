export function youtubeThumbnailUrl(
  videoId: string,
  quality: "hqdefault" | "maxresdefault" = "hqdefault"
): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}
