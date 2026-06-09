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
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[resend] RESEND_API_KEY missing — skipping email to", options.to);
      return true;
    }
    return false;
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
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[resend] failed:", text);
    return false;
  }
  return true;
}

function layout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#1A1A1A;border:1px solid #333;border-radius:4px;">
        <tr><td style="padding:32px 28px;">
          <p style="margin:0 0 24px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#FF5C00;">MX AI Academy</p>
          ${content}
        </td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:#666;">© MX AI Academy</p>
    </td></tr>
  </table>
</body>
</html>`;
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

  const html = layout(`
    <h1 style="margin:0 0 16px;font-size:24px;color:#F5F0E8;font-weight:600;">
      ${isFa ? `سلام ${name}!` : `Hi ${name}!`}
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#F5F0E8CC;">
      ${
        isFa
          ? `شما به برنامه <strong style="color:#F5F0E8;">${options.programTitle}</strong> دعوت شده‌اید. برای شروع، رمز عبور خود را تنظیم کنید و وارد پنل دانشجویی شوید.`
          : `You've been invited to <strong style="color:#F5F0E8;">${options.programTitle}</strong>. Set your password and access your student dashboard.`
      }
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#F5F0E8AA;">
      ${isFa ? "دسترسی تا:" : "Access until:"} <strong style="color:#FF5C00;">${endDate}</strong>
    </p>
    <a href="${options.inviteLink}" style="display:inline-block;background:#FF5C00;color:#0D0D0D;text-decoration:none;padding:14px 28px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;border-radius:2px;">
      ${isFa ? "تنظیم رمز و ورود" : "Set password & sign in"}
    </a>
  `);

  return sendEmail({ to: options.to, subject, html });
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

  const html = layout(`
    <h1 style="margin:0 0 16px;font-size:24px;color:#F5F0E8;font-weight:600;">
      ${isFa ? "خوش آمدید!" : "Welcome!"}
    </h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#F5F0E8CC;">
      ${
        isFa
          ? `${name} عزیز، دسترسی شما به <strong>${options.programTitle}</strong> فعال است. از پنل دانشجویی وارد شوید و یادگیری را شروع کنید.`
          : `Hi ${name}, your access to <strong>${options.programTitle}</strong> is active. Head to your student dashboard to start learning.`
      }
    </p>
    <a href="${options.learnUrl}" style="display:inline-block;background:#FF5C00;color:#0D0D0D;text-decoration:none;padding:14px 28px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;border-radius:2px;">
      ${isFa ? "ورود به پنل" : "Go to dashboard"}
    </a>
  `);

  return sendEmail({ to: options.to, subject, html });
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

  const html = layout(`
    <h1 style="margin:0 0 16px;font-size:24px;color:#F5F0E8;font-weight:600;">
      ${isFa ? "یادآوری دسترسی" : "Access reminder"}
    </h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#F5F0E8CC;">
      ${
        isFa
          ? `دسترسی شما به <strong>${options.programTitle}</strong> در تاریخ <strong style="color:#FF5C00;">${endDate}</strong> پایان می‌یابد. برای تمدید با ما تماس بگیرید.`
          : `Your access to <strong>${options.programTitle}</strong> ends on <strong style="color:#FF5C00;">${endDate}</strong>. Contact us if you'd like to extend.`
      }
    </p>
    <a href="${options.contactUrl}" style="display:inline-block;border:2px solid #F5F0E8;color:#F5F0E8;text-decoration:none;padding:12px 24px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;border-radius:2px;">
      ${isFa ? "تماس با ما" : "Contact us"}
    </a>
  `);

  return sendEmail({ to: options.to, subject, html });
}
