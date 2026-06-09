import type { Metadata } from "next";
import SetPasswordForm from "@/components/members/SetPasswordForm";
import { learnPath } from "@/lib/members/paths";
import { isValidLocale, type UrlLocale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SetPasswordPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = (isValidLocale(params.locale) ? params.locale : "en") as UrlLocale;
  return <SetPasswordForm redirectTo={learnPath(locale)} />;
}
