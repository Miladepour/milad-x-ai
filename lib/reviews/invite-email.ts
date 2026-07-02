import type { EmailBannerId } from "@/lib/email/banners";
import { DEFAULT_BROADCAST_BANNER_ID } from "@/lib/email/banners";
import { buildEmailLayout } from "@/lib/email/template";
import { reviewAbsoluteUrl } from "@/lib/reviews/paths";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function defaultReviewInviteSubject(options: {
  locale: "EN" | "FA";
  programTitle: string;
}): string {
  if (options.locale === "FA") {
    return `نظرتان درباره «${options.programTitle}»`;
  }
  return `How was ${options.programTitle}?`;
}

export function defaultReviewInviteBodyHtml(options: {
  locale: "EN" | "FA";
  programTitle: string;
  reviewUrl: string;
}): string {
  const isFa = options.locale === "FA";
  const title = escapeHtml(options.programTitle);
  const url = escapeHtml(options.reviewUrl);

  if (isFa) {
    return `
      <p>امیدوارم از دوره <strong>${title}</strong> لذت برده باشید.</p>
      <p>لطفاً چند دقیقه وقت بگذارید و بازخورد خود را با ما به اشتراک بگذارید — نظر شما به بهتر شدن دوره‌ها کمک می‌کند.</p>
      <p style="margin:28px 0;">
        <a href="${url}" style="display:inline-block;background:#E85D04;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:15px;">
          ثبت نظر
        </a>
      </p>
      <p style="font-size:14px;color:#6B6B6B;">اگر دکمه کار نکرد، این لینک را در مرورگر باز کنید:<br><a href="${url}" style="color:#E85D04;">${url}</a></p>
    `;
  }

  return `
    <p>I hope you enjoyed <strong>${title}</strong>.</p>
    <p>Please take a couple of minutes to share your feedback — your review helps me improve the program for future students.</p>
    <p style="margin:28px 0;">
      <a href="${url}" style="display:inline-block;background:#E85D04;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:15px;">
        Share your review
      </a>
    </p>
    <p style="font-size:14px;color:#6B6B6B;">If the button does not work, open this link in your browser:<br><a href="${url}" style="color:#E85D04;">${url}</a></p>
  `;
}

export function renderReviewInviteEmail(options: {
  fullName: string;
  locale: "EN" | "FA";
  programTitle: string;
  programSlug: string;
  bodyHtml?: string;
  bannerId?: EmailBannerId;
}): string {
  const isFa = options.locale === "FA";
  const name = options.fullName.trim() || (isFa ? "دانشجو" : "there");
  const greeting = isFa ? `سلام ${escapeHtml(name)}!` : `Hi ${escapeHtml(name)}!`;
  const reviewUrl = reviewAbsoluteUrl({
    locale: options.locale,
    programSlug: options.programSlug,
  });
  const body =
    options.bodyHtml?.trim() ||
    defaultReviewInviteBodyHtml({
      locale: options.locale,
      programTitle: options.programTitle,
      reviewUrl,
    });
  const bannerId = options.bannerId ?? DEFAULT_BROADCAST_BANNER_ID;

  return buildEmailLayout(
    `
    <h1 style="margin:0 0 20px;font-size:26px;line-height:1.3;color:#1A1A1A;font-weight:700;">${greeting}</h1>
    <div style="font-size:16px;line-height:1.7;color:#4A4A4A;">
      ${body}
    </div>
  `,
    { bannerId, locale: options.locale }
  );
}
