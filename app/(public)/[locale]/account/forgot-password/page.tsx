import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ForgotPasswordScreen from "@/components/members/ForgotPasswordScreen";
import { accountForgotPasswordPath, learnPath } from "@/lib/members/paths";
import { getStudentUser } from "@/lib/supabase/require-student";
import { isValidLocale, type UrlLocale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = (isValidLocale(params.locale) ? params.locale : "en") as UrlLocale;

  if (locale === "fa") {
    redirect(accountForgotPasswordPath());
  }

  const student = await getStudentUser();
  if (student) {
    redirect(learnPath(locale));
  }

  return <ForgotPasswordScreen />;
}
