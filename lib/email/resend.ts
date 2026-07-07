import type { EmailBannerId } from "@/lib/email/banners";
import {
  buildEmailLayout,
  buildTransactionalEmailLayout,
  emailPrimaryButton,
  emailSecondaryButton,
} from "@/lib/email/template";

const RESEND_API = "https://api.resend.com/emails";

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function emailFrom(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    "MX AI Academy <hello@mxaiacademy.com>"
  );
}

async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[resend] RESEND_API_KEY missing — skipping email to", options.to);
      return { ok: true, messageId: `dev-${Date.now()}` };
    }
    return { ok: false, error: "RESEND_API_KEY missing" };
  }

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom(),
      to: [options.to],
      subject: options.subject,
      html: options.html,
      ...(options.text ? { text: options.text } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[resend] failed:", text);
    return { ok: false, error: text };
  }

  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { ok: true, messageId: data.id };
}

export async function sendInviteEmail(options: {
  to: string;
  fullName: string;
  programTitle: string;
  accessStartsAt: string;
  accessEndsAt: string | null;
  inviteLink: string;
  locale: "EN" | "FA";
}): Promise<boolean> {
  const isFa = options.locale === "FA";
  const name = options.fullName || (isFa ? "دانشجو" : "there");
  const endDate = options.accessEndsAt
    ? new Date(options.accessEndsAt).toLocaleDateString(isFa ? "fa-IR" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : isFa
      ? "نامحدود"
      : "No expiry";

  const subject = isFa
    ? `دعوت به ${options.programTitle} — MX AI Academy`
    : `You're invited to ${options.programTitle} — MX AI Academy`;

  const html = buildTransactionalEmailLayout(
    `
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1A1A1A;font-weight:700;">
      ${isFa ? `سلام ${name}!` : `Hi ${name}!`}
    </h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#4A4A4A;">
      ${
        isFa
          ? `شما به برنامه <strong style="color:#1A1A1A;">${options.programTitle}</strong> دعوت شده‌اید. برای شروع، رمز عبور خود را تنظیم کنید و وارد پنل دانشجویی شوید.`
          : `You've been invited to <strong style="color:#1A1A1A;">${options.programTitle}</strong>. Set your password and access your student dashboard.`
      }
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#666;">
      ${isFa ? "دسترسی تا:" : "Access until:"} <strong style="color:#FF5C00;">${endDate}</strong>
    </p>
    ${emailPrimaryButton(options.inviteLink, isFa ? "تنظیم رمز و ورود" : "Set password & sign in")}
  `,
    { locale: options.locale }
  );

  const text = isFa
    ? `سلام ${name}!\n\nشما به برنامه ${options.programTitle} دعوت شده‌اید.\nدسترسی تا: ${endDate}\n\nتنظیم رمز و ورود:\n${options.inviteLink}\n\nMX AI Academy`
    : `Hi ${name}!\n\nYou've been invited to ${options.programTitle}.\nAccess until: ${endDate}\n\nSet password & sign in:\n${options.inviteLink}\n\nMX AI Academy`;

  return sendEmail({ to: options.to, subject, html, text }).then((r) => r.ok);
}

export async function sendPasswordResetEmail(options: {
  to: string;
  fullName: string;
  resetLink: string;
  locale: "EN" | "FA";
}): Promise<boolean> {
  const isFa = options.locale === "FA";
  const name = options.fullName || (isFa ? "دانشجو" : "there");

  const subject = isFa
    ? "بازنشانی رمز عبور — MX AI Academy"
    : "Reset your password — MX AI Academy";

  const html = buildTransactionalEmailLayout(
    `
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1A1A1A;font-weight:700;">
      ${isFa ? `سلام ${name}!` : `Hi ${name}!`}
    </h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#4A4A4A;">
      ${
        isFa
          ? "درخواست بازنشانی رمز عبور برای حساب دانشجویی شما ثبت شد. برای تنظیم رمز جدید روی دکمه زیر کلیک کنید."
          : "We received a request to reset the password for your student account. Click below to choose a new password."
      }
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#666;">
      ${
        isFa
          ? "اگر این درخواست را شما نداده‌اید، این ایمیل را نادیده بگیرید. این لینک پس از مدت کوتاهی منقضی می‌شود."
          : "If you did not request this, you can ignore this email. This link expires after a short time."
      }
    </p>
    ${emailPrimaryButton(options.resetLink, isFa ? "تنظیم رمز جدید" : "Reset password")}
  `,
    { locale: options.locale }
  );

  const text = isFa
    ? `سلام ${name}!\n\nدرخواست بازنشانی رمز عبور برای حساب دانشجویی شما ثبت شد.\n\nتنظیم رمز جدید:\n${options.resetLink}\n\nاگر این درخواست را شما نداده‌اید، این ایمیل را نادیده بگیرید.\n\nMX AI Academy`
    : `Hi ${name}!\n\nWe received a request to reset your student account password.\n\nReset password:\n${options.resetLink}\n\nIf you did not request this, you can ignore this email.\n\nMX AI Academy`;

  return sendEmail({ to: options.to, subject, html, text }).then((r) => r.ok);
}

export async function sendWelcomeEmail(options: {
  to: string;
  fullName: string;
  programTitle: string;
  learnUrl: string;
  locale: "EN" | "FA";
}): Promise<boolean> {
  const isFa = options.locale === "FA";
  const name = options.fullName || (isFa ? "دانشجو" : "there");

  const subject = isFa
    ? `خوش آمدید به ${options.programTitle}`
    : `Welcome to ${options.programTitle}`;

  const html = buildEmailLayout(
    `
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.3;color:#1A1A1A;font-weight:700;">
      ${isFa ? "خوش آمدید!" : "Welcome!"}
    </h1>
    <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:#4A4A4A;">
      ${
        isFa
          ? `${name} عزیز، دسترسی شما به <strong style="color:#1A1A1A;">${options.programTitle}</strong> فعال است. از پنل دانشجویی وارد شوید و یادگیری را شروع کنید.`
          : `Hi ${name}, your access to <strong style="color:#1A1A1A;">${options.programTitle}</strong> is active. Head to your student dashboard to start learning.`
      }
    </p>
    ${emailPrimaryButton(options.learnUrl, isFa ? "ورود به پنل" : "Go to dashboard")}
  `,
    { bannerId: "welcome", locale: options.locale }
  );

  return sendEmail({ to: options.to, subject, html }).then((r) => r.ok);
}

export async function sendAccessExpiringEmail(options: {
  to: string;
  fullName: string;
  programTitle: string;
  accessEndsAt: string;
  contactUrl: string;
  locale: "EN" | "FA";
}): Promise<boolean> {
  const isFa = options.locale === "FA";
  const endDate = new Date(options.accessEndsAt).toLocaleDateString(
    isFa ? "fa-IR" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const subject = isFa
    ? `دسترسی شما به ${options.programTitle} به زودی پایان می‌یابد`
    : `Your access to ${options.programTitle} is ending soon`;

  const html = buildEmailLayout(
    `
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.3;color:#1A1A1A;font-weight:700;">
      ${isFa ? "یادآوری دسترسی" : "Access reminder"}
    </h1>
    <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:#4A4A4A;">
      ${
        isFa
          ? `دسترسی شما به <strong style="color:#1A1A1A;">${options.programTitle}</strong> در تاریخ <strong style="color:#FF5C00;">${endDate}</strong> پایان می‌یابد. برای تمدید با ما تماس بگیرید.`
          : `Your access to <strong style="color:#1A1A1A;">${options.programTitle}</strong> ends on <strong style="color:#FF5C00;">${endDate}</strong>. Contact us if you'd like to extend.`
      }
    </p>
    ${emailSecondaryButton(options.contactUrl, isFa ? "تماس با ما" : "Contact us")}
  `,
    { bannerId: "access-reminder", locale: options.locale }
  );

  return sendEmail({ to: options.to, subject, html }).then((r) => r.ok);
}

export { buildEmailLayout } from "@/lib/email/template";
export type { EmailBannerId };

export async function sendRawEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  return sendEmail(options);
}
