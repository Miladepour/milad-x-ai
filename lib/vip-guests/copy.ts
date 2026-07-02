import type { LocaleCode } from "@/lib/supabase/database.types";

export const VIP_PASS_BACKGROUND = "#0D0D0D";

export function formatVipEventDate(dateIso: string, locale: LocaleCode): string {
  return new Date(`${dateIso}T12:00:00`).toLocaleDateString(
    locale === "FA" ? "fa-IR" : "en-GB",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );
}

export function buildVipInvitationMessage(options: {
  fullName: string;
  eventTitle: string;
  eventDate: string;
  locale: LocaleCode;
}): { greeting: string; body: string; closing: string; signature: string } {
  const date = formatVipEventDate(options.eventDate, options.locale);
  const isFa = options.locale === "FA";

  if (isFa) {
    return {
      greeting: `${options.fullName} عزیز،`,
      body: `از اینکه شما را به ${options.eventTitle} در تاریخ ${date} دعوت کنیم افتخار می‌کنیم.\n\nحضور گرامی‌تان برای ما بسیار ارزشمند است.`,
      closing: "",
      signature: "آکادمی MX AI",
    };
  }

  return {
    greeting: `Dear ${options.fullName},`,
    body: `We are honoured to invite you to ${options.eventTitle} on ${date}.\n\nYour presence would be greatly appreciated.`,
    closing: "",
    signature: "MX AI Academy",
  };
}
