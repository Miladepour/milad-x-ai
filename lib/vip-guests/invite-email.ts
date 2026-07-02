import type { EmailBannerId } from "@/lib/email/banners";
import { buildEmailLayout } from "@/lib/email/template";
import { vipPassAbsoluteUrl } from "@/lib/vip-guests/paths";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatEventDate(dateIso: string, locale: "EN" | "FA"): string {
  return new Date(`${dateIso}T12:00:00`).toLocaleDateString(
    locale === "FA" ? "fa-IR" : "en-GB",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );
}

export function defaultVipGuestInviteSubject(options: {
  locale: "EN" | "FA";
  eventTitle: string;
}): string {
  if (options.locale === "FA") {
    return `دعوت ویژه — ${options.eventTitle}`;
  }
  return `Your VIP invitation — ${options.eventTitle}`;
}

export function defaultVipGuestInviteBodyHtml(options: {
  locale: "EN" | "FA";
  fullName: string;
  eventTitle: string;
  eventDate: string;
  passUrl: string;
}): string {
  const isFa = options.locale === "FA";
  const name = escapeHtml(options.fullName || (isFa ? "مهمان گرامی" : "there"));
  const title = escapeHtml(options.eventTitle);
  const date = escapeHtml(formatEventDate(options.eventDate, options.locale));
  const url = escapeHtml(options.passUrl);

  if (isFa) {
    return `
      <p>سلام ${name}،</p>
      <p>از حضور شما در <strong>${title}</strong> بسیار خوشحالیم.</p>
      <p>تاریخ رویداد: <strong>${date}</strong></p>
      <p>برای دریافت کارت VIP اختصاصی خود و اشتراک‌گذاری آن، روی دکمه زیر بزنید:</p>
      <p style="margin:28px 0;">
        <a href="${url}" style="display:inline-block;background:#E85D04;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:15px;">
          مشاهده کارت VIP
        </a>
      </p>
      <p style="font-size:14px;color:#6B6B6B;">اگر دکمه کار نکرد، این لینک را در مرورگر باز کنید:<br><a href="${url}" style="color:#E85D04;">${url}</a></p>
    `;
  }

  return `
    <p>Dear ${name},</p>
    <p>It is our pleasure to welcome you to <strong>${title}</strong>.</p>
    <p>Event date: <strong>${date}</strong></p>
    <p>Tap below to view your personal VIP pass — download it and share it on your story if you would like.</p>
    <p style="margin:28px 0;">
      <a href="${url}" style="display:inline-block;background:#E85D04;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:15px;">
        View your VIP pass
      </a>
    </p>
    <p style="font-size:14px;color:#6B6B6B;">If the button does not work, open this link in your browser:<br><a href="${url}" style="color:#E85D04;">${url}</a></p>
  `;
}

export function renderVipGuestInviteEmail(options: {
  locale: "EN" | "FA";
  fullName: string;
  eventTitle: string;
  eventDate: string;
  token: string;
  bannerId?: EmailBannerId;
}): { subject: string; html: string } {
  const passUrl = vipPassAbsoluteUrl({ locale: options.locale, token: options.token });
  const subject = defaultVipGuestInviteSubject({
    locale: options.locale,
    eventTitle: options.eventTitle,
  });
  const body = defaultVipGuestInviteBodyHtml({
    locale: options.locale,
    fullName: options.fullName,
    eventTitle: options.eventTitle,
    eventDate: options.eventDate,
    passUrl,
  });
  const html = buildEmailLayout(body, {
    bannerId: options.bannerId ?? "workshop",
    locale: options.locale,
  });

  return { subject, html };
}
