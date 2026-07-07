"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface PortfolioCarouselProps {
  ariaLabel: string;
  prevLabel: string;
  nextLabel: string;
  children: ReactNode;
}

export default function PortfolioCarousel({
  ariaLabel,
  prevLabel,
  nextLabel,
  children,
}: PortfolioCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 4) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    const observer = new ResizeObserver(() => updateScrollState());
    observer.observe(el);

    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });

    const images = el.querySelectorAll("img");
    const onImageLoad = () => updateScrollState();
    images.forEach((img) => {
      if (img.complete) onImageLoad();
      else img.addEventListener("load", onImageLoad);
    });

    const raf = requestAnimationFrame(updateScrollState);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      el.removeEventListener("scroll", onScroll);
      images.forEach((img) => img.removeEventListener("load", onImageLoad));
    };
  }, [updateScrollState, children]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.82, 280);
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  const arrowClass =
    "pointer-events-auto absolute top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-surface bg-background/95 text-cream shadow-lg backdrop-blur-sm transition-colors duration-200 hover:border-orange hover:text-orange disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="relative overflow-hidden py-1">
      <button
        type="button"
        aria-label={prevLabel}
        disabled={!canScrollLeft}
        onClick={() => scroll("left")}
        className={`${arrowClass} start-0 -ms-1 md:-ms-3`}
      >
        <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
      </button>

      <button
        type="button"
        aria-label={nextLabel}
        disabled={!canScrollRight}
        onClick={() => scroll("right")}
        className={`${arrowClass} end-0 -me-1 md:-me-3`}
      >
        <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
      </button>

      <div
        ref={scrollRef}
        dir="ltr"
        role="region"
        aria-label={ariaLabel}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory overscroll-x-contain px-11 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
