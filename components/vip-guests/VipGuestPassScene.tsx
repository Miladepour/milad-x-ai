"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  getVipBadgeSizeTokens,
  type VipBadgeSize,
} from "@/lib/vip-guests/badge-sizes";
import VipGuestBadgeCard, { type VipGuestBadgeData } from "./VipGuestBadgeCard";

interface VipGuestPassSceneProps {
  data: VipGuestBadgeData;
  animate?: boolean;
  className?: string;
  size?: VipBadgeSize;
}

/** Black woven fabric with a single orange racing stripe + stitched edges */
function fabricStrapStyle(width: number): CSSProperties {
  const stripe = Math.max(3, Math.round(width * 0.18));
  const stripeInset = Math.round(width * 0.22);
  return {
    backgroundImage: [
      // orange racing stripe
      `linear-gradient(90deg, transparent ${stripeInset}px, rgba(255,92,0,0.9) ${stripeInset}px, rgba(255,140,40,0.95) ${stripeInset + stripe}px, transparent ${stripeInset + stripe}px)`,
      // fabric weave
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)",
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 2px)",
      // base with rounded shading across the width
      "linear-gradient(90deg, #060606 0%, #232323 18%, #2E2E2E 50%, #232323 82%, #060606 100%)",
    ].join(", "),
    boxShadow: [
      "inset 1px 0 0 rgba(255,255,255,0.07)",
      "inset -1px 0 0 rgba(0,0,0,0.6)",
      "0 4px 14px rgba(0,0,0,0.5)",
    ].join(", "),
  };
}

function FabricStrap({
  rotate,
  offsetX,
  height,
  width,
}: {
  rotate: number;
  offsetX: number;
  height: number;
  width: number;
}) {
  return (
    <div
      aria-hidden
      className="absolute top-0 origin-top overflow-hidden"
      style={{
        ...fabricStrapStyle(width),
        left: offsetX,
        width,
        height,
        transform: `rotate(${rotate}deg)`,
        borderRadius: "0 0 2px 2px",
      }}
    >
      {/* stitched edges */}
      <div
        className="absolute inset-y-0"
        style={{
          left: 2,
          width: 1,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,140,40,0.55) 0 4px, transparent 4px 8px)",
        }}
      />
      <div
        className="absolute inset-y-0"
        style={{
          right: 2,
          width: 1,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,140,40,0.55) 0 4px, transparent 4px 8px)",
        }}
      />
    </div>
  );
}

function LanyardStraps({
  strapHeight,
  strapWidth,
}: {
  strapHeight: number;
  strapWidth: number;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0"
      style={{ height: strapHeight }}
    >
      <div className="absolute left-1/2 top-0 h-full w-0 -translate-x-1/2">
        <FabricStrap
          rotate={-12}
          offsetX={-strapWidth - 5}
          height={strapHeight}
          width={strapWidth}
        />
        <FabricStrap
          rotate={12}
          offsetX={5}
          height={strapHeight}
          width={strapWidth}
        />
      </div>
    </div>
  );
}

/** Metal crimp where both straps gather, with rivet detail */
function StrapCrimp({ width }: { width: number }) {
  return (
    <div
      aria-hidden
      className="relative"
      style={{
        width,
        height: 22,
        borderRadius: "3px 3px 5px 5px",
        background:
          "linear-gradient(180deg, #F0F0F0 0%, #B8B8B8 30%, #9A9A9A 55%, #C9C9C9 80%, #6E6E6E 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 1px rgba(0,0,0,0.45), 0 3px 10px rgba(0,0,0,0.55)",
      }}
    >
      <div
        className="absolute inset-x-[3px] top-[8px] h-[2px] rounded-full"
        style={{ background: "rgba(0,0,0,0.35)" }}
      />
      <div
        className="absolute left-1/2 top-[13px] h-[5px] w-[5px] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 30%, #E8E8E8 0%, #7A7A7A 70%)",
          boxShadow: "0 1px 1px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  );
}

/** Silver lobster-claw clasp with swivel ring — bottom hook goes through the badge grommet */
function LobsterClasp({ height }: { height: number }) {
  const width = Math.round(height * 0.72);
  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      viewBox="0 0 36 56"
      fill="none"
      className="relative z-20 drop-shadow-[0_5px_10px_rgba(0,0,0,0.55)]"
      style={{ marginTop: -2 }}
    >
      {/* attachment loop under crimp */}
      <path
        d="M18 1 C14.5 1 12 3.5 12 6.5 C12 9.5 14.5 12 18 12 C21.5 12 24 9.5 24 6.5 C24 3.5 21.5 1 18 1 Z M18 3.5 C19.9 3.5 21.5 4.9 21.5 6.5 C21.5 8.1 19.9 9.5 18 9.5 C16.1 9.5 14.5 8.1 14.5 6.5 C14.5 4.9 16.1 3.5 18 3.5 Z"
        fill="url(#vipClaspMetal)"
        stroke="#6E6E6E"
        strokeWidth="0.4"
      />
      {/* swivel barrel */}
      <rect x="14.5" y="11" width="7" height="7" rx="2" fill="url(#vipClaspMetal)" stroke="#777" strokeWidth="0.4" />
      <rect x="14.5" y="13.6" width="7" height="1.2" fill="rgba(0,0,0,0.3)" />
      {/* clasp body */}
      <path
        d="M18 18 C13.5 18 10.5 21 10.5 25 L10.5 30 C7.5 32 5.5 35.5 5.5 39.5 C5.5 45.5 10 49.5 16 49.5 L20 49.5 C26 49.5 30.5 45.5 30.5 39.5 C30.5 35.5 28.5 32 25.5 30 L25.5 25 C25.5 21 22.5 18 18 18 Z"
        fill="url(#vipClaspMetal)"
        stroke="#777"
        strokeWidth="0.5"
      />
      {/* body highlight */}
      <ellipse cx="15" cy="36" rx="4" ry="7" fill="#FFFFFF" opacity="0.35" />
      <ellipse cx="20" cy="39" rx="5.5" ry="6.5" fill="#8F8F8F" opacity="0.5" />
      {/* trigger gate */}
      <path
        d="M26 26 L30 22.5 C30.8 21.8 31 20.8 30.4 20 C29.8 19.2 28.8 19.1 28 19.7 L24 23"
        stroke="url(#vipClaspMetal)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* hook that drops through the badge hole */}
      <path
        d="M14.5 49.5 L14.5 51.5 C14.5 54 16 55.5 18 55.5 C20 55.5 21.5 54 21.5 51.5 L21.5 49.5"
        fill="url(#vipClaspMetal)"
        stroke="#666"
        strokeWidth="0.5"
      />
      <defs>
        <linearGradient id="vipClaspMetal" x1="18" y1="0" x2="18" y2="56">
          <stop offset="0%" stopColor="#F2F2F2" />
          <stop offset="35%" stopColor="#C4C4C4" />
          <stop offset="65%" stopColor="#9E9E9E" />
          <stop offset="100%" stopColor="#828282" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Straps → crimp → clasp → badge (hook through grommet) */
function LanyardBadgeHang({
  data,
  size,
}: {
  data: VipGuestBadgeData;
  size: VipBadgeSize;
}) {
  const tokens = getVipBadgeSizeTokens(size);
  const strapWidth = Math.round(tokens.strapHeight * 0.26);
  const crimpWidth = Math.round(strapWidth * 1.15);

  return (
    <div className="relative flex flex-col items-center">
      {/* Straps run down to crimp + clasp */}
      <div
        className="relative w-full"
        style={{ height: tokens.strapHeight, marginBottom: -6 }}
      >
        <LanyardStraps strapHeight={tokens.strapHeight} strapWidth={strapWidth} />
        <div className="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
          <StrapCrimp width={crimpWidth} />
          <LobsterClasp height={tokens.claspHeight} />
        </div>
      </div>

      {/* Badge pulled up so clasp hook sits inside the grommet */}
      <div
        className="relative z-0"
        style={{ marginTop: -tokens.badgeAttachOverlap }}
      >
        <VipGuestBadgeCard data={data} size={size} />
      </div>
    </div>
  );
}

/** Shared lanyard + clip + badge assembly */
export function VipGuestPassAssembly({
  data,
  swing = false,
  size = "page",
}: {
  data: VipGuestBadgeData;
  swing?: boolean;
  size?: VipBadgeSize;
}) {
  const reduceMotion = useReducedMotion();
  const shouldSwing = swing && !reduceMotion;
  const tokens = getVipBadgeSizeTokens(size);

  const hang = <LanyardBadgeHang data={data} size={size} />;

  const assemblyHeight =
    tokens.strapHeight + tokens.cardHeight - tokens.badgeAttachOverlap + 40;

  return (
    <div
      className="relative mx-auto flex flex-col items-center"
      style={{ width: tokens.sceneWidth, minHeight: assemblyHeight }}
    >
      {shouldSwing ? (
        <motion.div
          className="flex flex-col items-center"
          style={{ transformOrigin: "top center" }}
          initial={{ rotate: -5.5 }}
          animate={{ rotate: [-5.5, 3.6, -2.2, 1.2, -0.6, 0.25, 0] }}
          transition={{
            delay: 0.45,
            duration: 3.4,
            ease: "easeInOut",
            times: [0, 0.2, 0.38, 0.55, 0.72, 0.87, 1],
          }}
        >
          {hang}
        </motion.div>
      ) : (
        hang
      )}
    </div>
  );
}

export default function VipGuestPassScene({
  data,
  animate = true,
  className = "",
  size = "page",
}: VipGuestPassSceneProps) {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animate && !reduceMotion;
  const tokens = getVipBadgeSizeTokens(size);

  return (
    <div
      className={`relative mx-auto ${className}`}
      style={{ width: tokens.sceneWidth }}
    >
      <motion.div
        initial={shouldAnimate ? { y: -160, opacity: 0 } : false}
        animate={shouldAnimate ? { y: 0, opacity: 1 } : false}
        transition={{ type: "spring", stiffness: 64, damping: 13, mass: 1.3 }}
      >
        <VipGuestPassAssembly data={data} swing={animate} size={size} />
      </motion.div>
    </div>
  );
}

export function VipGuestPassSceneStatic({
  data,
  className = "",
  size = "page",
}: {
  data: VipGuestBadgeData;
  className?: string;
  size?: VipBadgeSize;
}) {
  return (
    <div className={className}>
      <VipGuestPassAssembly data={data} swing={false} size={size} />
    </div>
  );
}
