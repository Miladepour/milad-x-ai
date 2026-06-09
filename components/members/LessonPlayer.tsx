"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isVimeoUrl,
  isYoutubeUrl,
  vimeoEmbedUrl,
  youtubeEmbedUrl,
} from "@/lib/members/video";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface LessonPlayerProps {
  lessonId: string;
  videoUrl: string | null;
  initialPosition?: number;
  completed?: boolean;
}

export default function LessonPlayer({
  lessonId,
  videoUrl,
  initialPosition = 0,
  completed = false,
}: LessonPlayerProps) {
  const t = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isComplete, setIsComplete] = useState(completed);
  const [status, setStatus] = useState("");

  const saveProgress = useCallback(
    async (opts: { lastPositionSeconds?: number; completed?: boolean }) => {
      try {
        await fetch("/api/members/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ lessonId, ...opts }),
        });
        if (opts.completed) setIsComplete(true);
      } catch {
        setStatus("Could not save progress.");
      }
    },
    [lessonId]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl || isYoutubeUrl(videoUrl) || isVimeoUrl(videoUrl)) {
      return;
    }

    if (initialPosition > 0) {
      video.currentTime = initialPosition;
    }

    const onTimeUpdate = () => {
      const duration = video.duration;
      if (!duration || !Number.isFinite(duration)) return;
      if (video.currentTime / duration >= 0.9) {
        void saveProgress({
          lastPositionSeconds: Math.floor(video.currentTime),
          completed: true,
        });
      }
    };

    const interval = window.setInterval(() => {
      void saveProgress({ lastPositionSeconds: Math.floor(video.currentTime) });
    }, 30000);

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      window.clearInterval(interval);
    };
  }, [videoUrl, initialPosition, saveProgress]);

  if (!videoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center border border-surface bg-surface/30">
        <p className="font-dm text-sm text-cream/60">Video coming soon.</p>
      </div>
    );
  }

  if (isYoutubeUrl(videoUrl)) {
    const embed = youtubeEmbedUrl(videoUrl);
    if (!embed) return null;
    return (
      <div className="aspect-video overflow-hidden border border-surface bg-black">
        <iframe
          src={embed}
          title="Lesson video"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (isVimeoUrl(videoUrl)) {
    const embed = vimeoEmbedUrl(videoUrl);
    if (!embed) return null;
    return (
      <div className="aspect-video overflow-hidden border border-surface bg-black">
        <iframe
          src={embed}
          title="Lesson video"
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-video overflow-hidden border border-surface bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          playsInline
          className="h-full w-full"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isComplete}
          onClick={() => saveProgress({ completed: true })}
          className="border border-orange px-4 py-2 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background disabled:opacity-50"
        >
          {isComplete ? t.memberPortal.completed : t.memberPortal.markComplete}
        </button>
        {status && <p className="font-dm text-xs text-orange">{status}</p>}
      </div>
    </div>
  );
}
