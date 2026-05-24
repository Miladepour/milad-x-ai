"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { PortfolioReel } from "@/lib/portfolio/media";
import { useTranslation } from "@/lib/i18n/useTranslation";

const CARD_WIDTH = 220;
const CARD_GAP = 0.62;

function wrapOffset(index: number, active: number, length: number) {
  let offset = index - active;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}

function cardTransform(offset: number) {
  if (offset === 0) {
    return {
      x: 0,
      scale: 1,
      rotateY: 0,
      zIndex: 30,
      opacity: 1,
    };
  }

  const sign = offset > 0 ? 1 : -1;
  const abs = Math.abs(offset);

  return {
    x: sign * CARD_WIDTH * CARD_GAP * Math.min(abs, 2.2),
    scale: Math.max(0.68, 1 - abs * 0.14),
    rotateY: sign * -Math.min(38, 18 + abs * 10),
    zIndex: Math.max(1, 20 - abs * 6),
    opacity: abs > 2 ? 0 : Math.max(0.35, 1 - abs * 0.22),
  };
}

interface ReelCoverFlowCarouselProps {
  reels: PortfolioReel[];
  ariaLabel: string;
}

export default function ReelCoverFlowCarousel({
  reels,
  ariaLabel,
}: ReelCoverFlowCarouselProps) {
  const t = useTranslation();
  const w = t.aiwork;
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const dragStartX = useRef(0);
  const didDrag = useRef(false);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % reels.length) + reels.length) % reels.length);
      setPlayingId(null);
    },
    [reels.length]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, el]) => {
      if (!el || id === playingId) return;
      el.pause();
      el.currentTime = 0;
    });
  }, [playingId]);

  const handlePlay = async (reel: PortfolioReel, offset: number) => {
    if (offset !== 0) {
      goTo(reels.findIndex((r) => r.id === reel.id));
      return;
    }

    const video = videoRefs.current[reel.id];
    if (!video) return;

    if (playingId === reel.id) {
      video.pause();
      setPlayingId(null);
      return;
    }

    setPlayingId(reel.id);
    video.currentTime = 0;

    try {
      await video.play();
    } catch {
      setPlayingId(null);
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    didDrag.current = false;
    dragStartX.current = e.clientX;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 8) didDrag.current = true;
    setDragX(delta);
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX.current;
    setIsDragging(false);
    setDragX(0);

    if (delta > 56) goPrev();
    else if (delta < -56) goNext();

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // already released
    }
  };

  const onCardClick = (index: number) => {
    if (didDrag.current || index === activeIndex) return;
    goTo(index);
  };

  if (reels.length === 0) return null;

  const arrowClass =
    "absolute top-1/2 z-40 flex h-11 w-11 md:h-12 md:w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-orange bg-orange/15 text-orange shadow-[0_0_20px_rgba(255,92,0,0.25)] backdrop-blur-sm transition-all duration-200 hover:bg-orange hover:text-background hover:shadow-[0_0_24px_rgba(255,92,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <div className="relative w-full select-none" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={goPrev}
        className={`${arrowClass} left-0 md:-left-2`}
        aria-label={w.scrollPrev}
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
      </button>

      <button
        type="button"
        onClick={goNext}
        className={`${arrowClass} right-0 md:-right-2`}
        aria-label={w.scrollNext}
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
      </button>

      <div
        className="relative mx-auto h-[min(72vh,520px)] max-h-[520px] w-full cursor-grab active:cursor-grabbing touch-pan-y px-12 md:px-14"
        style={{ perspective: "1400px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {reels.map((reel, index) => {
            const offset = wrapOffset(index, activeIndex, reels.length);
            const { x, scale, rotateY, zIndex, opacity } = cardTransform(offset);
            const isActive = offset === 0;
            const isPlaying = playingId === reel.id && isActive;

            return (
              <div
                key={reel.id}
                role="presentation"
                onClick={() => onCardClick(index)}
                className="absolute w-[min(58vw,220px)] aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.55)] transition-[transform,opacity] duration-500 ease-out will-change-transform cursor-pointer"
                style={{
                  transform: `translateX(calc(${x}px + ${isDragging ? dragX * 0.15 : 0}px)) scale(${scale}) rotateY(${rotateY}deg)`,
                  zIndex,
                  opacity,
                  pointerEvents: Math.abs(offset) > 2 ? "none" : "auto",
                }}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[reel.id] = el;
                  }}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                    isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                  src={reel.src}
                  poster={reel.poster}
                  playsInline
                  preload="metadata"
                  loop
                  muted={false}
                  aria-label={reel.title}
                />

                <div
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
                  style={{
                    backgroundImage: `url(${reel.poster})`,
                    opacity: isPlaying ? 0 : 1,
                  }}
                  aria-hidden
                />

                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  style={{
                    background: isPlaying
                      ? "linear-gradient(180deg, transparent 45%, rgba(13,13,13,0.55) 75%, rgba(13,13,13,0.92) 100%)"
                      : "linear-gradient(180deg, rgba(255,92,0,0.35) 0%, rgba(255,92,0,0.12) 35%, rgba(13,13,13,0.5) 70%, rgba(13,13,13,0.85) 100%)",
                  }}
                />

                <div
                  className={`absolute inset-0 flex pointer-events-none transition-all duration-300 ease-out ${
                    isPlaying
                      ? "flex-row items-end justify-start gap-2.5 px-3 pb-3 text-start"
                      : "flex-col items-center justify-center gap-3 px-4 text-center"
                  }`}
                >
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handlePlay(reel, offset);
                    }}
                    className={`pointer-events-auto shrink-0 flex items-center justify-center rounded-full border-2 border-cream/90 bg-background/40 text-cream backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-orange hover:bg-orange/20 hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
                      isPlaying ? "h-9 w-9" : "h-14 w-14"
                    }`}
                    aria-label={
                      isPlaying
                        ? `${w.pauseVideo}: ${reel.title}`
                        : `${w.playVideo}: ${reel.title}`
                    }
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 fill-current" aria-hidden />
                    ) : (
                      <Play className="h-6 w-6 fill-current ml-0.5" aria-hidden />
                    )}
                  </button>

                  <div
                    className={`min-w-0 transition-all duration-300 ${
                      isPlaying ? "space-y-0.5 pb-0.5" : "space-y-1"
                    }`}
                  >
                    <p
                      className={`font-dm font-semibold text-cream leading-snug drop-shadow-md transition-all duration-300 ${
                        isPlaying
                          ? "text-[11px] leading-tight line-clamp-2"
                          : "text-sm md:text-base"
                      }`}
                    >
                      {reel.title}
                    </p>
                    {!isPlaying && (
                      <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-cream/85 rtl:tracking-normal">
                        {w.createdWithAi}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-[min(90%,420px)] -translate-x-1/2 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,92,0,0.35) 0%, transparent 70%)",
          }}
          aria-hidden
        />
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {reels.map((reel, index) => (
          <button
            key={reel.id}
            type="button"
            onClick={() => goTo(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "w-8 bg-orange"
                : "w-1.5 bg-surface hover:bg-cream/40"
            }`}
            aria-label={`${reel.title}`}
            aria-current={index === activeIndex}
          />
        ))}
      </div>
    </div>
  );
}
