"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isBunnyUrl } from "@/lib/members/bunny";
import {
  isVimeoUrl,
  isYoutubeUrl,
  vimeoEmbedUrl,
  youtubeEmbedUrl,
} from "@/lib/members/video";
import { useTranslation } from "@/lib/i18n/useTranslation";
import LessonVideoPoster from "@/components/members/LessonVideoPoster";

interface LessonPlayerProps {
  lessonId: string;
  videoUrl: string | null;
  lessonTitle?: string;
  initialPosition?: number;
  completed?: boolean;
}

function LessonProgressActions({
  isComplete,
  status,
  onMarkComplete,
}: {
  isComplete: boolean;
  status: string;
  onMarkComplete: () => void;
}) {
  const t = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.08] px-4 py-4 sm:px-5">
      <button
        type="button"
        disabled={isComplete}
        onClick={onMarkComplete}
        className="rounded-full border border-orange/50 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-orange transition-colors hover:bg-orange hover:text-background disabled:opacity-50"
      >
        {isComplete ? t.memberPortal.completed : t.memberPortal.markComplete}
      </button>
      {status && <p className="font-dm text-sm text-orange">{status}</p>}
      {!isComplete && (
        <p className="font-dm text-xs text-cream/50">
          {t.memberPortal.progressHintEmbed}
        </p>
      )}
    </div>
  );
}

export default function LessonPlayer({
  lessonId,
  videoUrl,
  lessonTitle = "",
  initialPosition = 0,
  completed = false,
}: LessonPlayerProps) {
  const t = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isComplete, setIsComplete] = useState(completed);
  const [status, setStatus] = useState("");
  const [bunnyStarted, setBunnyStarted] = useState(false);
  const [bunnyEmbed, setBunnyEmbed] = useState<string | null>(null);
  const [bunnyLoadError, setBunnyLoadError] = useState("");

  const saveProgress = useCallback(
    async (opts: { lastPositionSeconds?: number; completed?: boolean }) => {
      try {
        const res = await fetch("/api/members/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ lessonId, ...opts }),
        });
        if (!res.ok) throw new Error("Save failed");
        if (opts.completed) {
          setIsComplete(true);
          setStatus("");
        }
      } catch {
        setStatus("Could not save progress.");
      }
    },
    [lessonId]
  );

  const markComplete = useCallback(() => {
    void saveProgress({ completed: true });
  }, [saveProgress]);

  useEffect(() => {
    if (!videoUrl || !isBunnyUrl(videoUrl) || !bunnyStarted) {
      if (!bunnyStarted) {
        setBunnyEmbed(null);
        setBunnyLoadError("");
      }
      return;
    }

    let cancelled = false;
    setBunnyEmbed(null);
    setBunnyLoadError("");

    void (async () => {
      try {
        const qs = new URLSearchParams({
          videoUrl,
          autoplay: "true",
          preload: "false",
        });
        const res = await fetch(`/api/members/bunny-embed?${qs.toString()}`, {
          credentials: "same-origin",
        });
        const data = (await res.json()) as { embedUrl?: string; error?: string };
        if (cancelled) return;
        if (!res.ok || !data.embedUrl) {
          setBunnyLoadError(data.error ?? "Could not load video.");
          return;
        }
        setBunnyEmbed(data.embedUrl);
      } catch {
        if (!cancelled) setBunnyLoadError("Could not load video.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [videoUrl, bunnyStarted]);

  useEffect(() => {
    const video = videoRef.current;
    if (
      !video ||
      !videoUrl ||
      isYoutubeUrl(videoUrl) ||
      isVimeoUrl(videoUrl) ||
      isBunnyUrl(videoUrl)
    ) {
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
    if (!embed) {
      return (
        <div className="flex aspect-video items-center justify-center border border-surface bg-surface/30">
          <p className="font-dm text-sm text-cream/60">Invalid YouTube link.</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
        <div className="relative aspect-video overflow-hidden bg-black">
          <iframe
            src={embed}
            title="Lesson video"
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <LessonProgressActions
          isComplete={isComplete}
          status={status}
          onMarkComplete={markComplete}
        />
      </div>
    );
  }

  if (isVimeoUrl(videoUrl)) {
    const embed = vimeoEmbedUrl(videoUrl);
    if (!embed) return null;
    return (
      <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
        <div className="relative aspect-video overflow-hidden bg-black">
          <iframe
            src={embed}
            title="Lesson video"
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
        <LessonProgressActions
          isComplete={isComplete}
          status={status}
          onMarkComplete={markComplete}
        />
      </div>
    );
  }

  if (isBunnyUrl(videoUrl)) {
    const playLabel = lessonTitle
      ? `${t.memberPortal.playLesson}: ${lessonTitle}`
      : t.memberPortal.playLesson;

    return (
      <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
        <div className="relative aspect-video overflow-hidden bg-black">
          {!bunnyStarted ? (
            <LessonVideoPoster
              title={lessonTitle || "Lesson video"}
              playLabel={playLabel}
              onPlay={() => setBunnyStarted(true)}
            />
          ) : bunnyEmbed ? (
            <iframe
              src={bunnyEmbed}
              title="Lesson video"
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="font-dm text-sm text-cream/60">
                {bunnyLoadError || t.memberPortal.loadingVideo}
              </p>
            </div>
          )}
        </div>
        <LessonProgressActions
          isComplete={isComplete}
          status={status}
          onMarkComplete={markComplete}
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
      <LessonProgressActions
        isComplete={isComplete}
        status={status}
        onMarkComplete={markComplete}
      />
    </div>
  );
}
