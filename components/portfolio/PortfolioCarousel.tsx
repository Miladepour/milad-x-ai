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
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    el.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", updateScrollState);
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
    "absolute top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-surface bg-background/90 text-cream shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-orange hover:text-orange disabled:pointer-events-none disabled:opacity-25";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={prevLabel}
        disabled={!canScrollLeft}
        onClick={() => scroll("left")}
        className={`${arrowClass} left-0 -translate-x-1/2 md:-translate-x-4`}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>

      <button
        type="button"
        aria-label={nextLabel}
        disabled={!canScrollRight}
        onClick={() => scroll("right")}
        className={`${arrowClass} right-0 translate-x-1/2 md:translate-x-4`}
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>

      <div
        ref={scrollRef}
        role="region"
        aria-label={ariaLabel}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
