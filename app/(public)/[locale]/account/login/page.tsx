import type { Metadata } from "next";
import { redirect } from "next/navigation";
import StudentLoginScreen from "@/components/members/StudentLoginScreen";
import {
  accountLoginPath,
  resolveStudentLoginRedirect,
} from "@/lib/members/paths";
import { getStudentUser } from "@/lib/supabase/require-student";
import { isValidLocale, type UrlLocale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function StudentLoginPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { redirectTo?: string };
}) {
  const locale = (isValidLocale(params.locale) ? params.locale : "en") as UrlLocale;
  const redirectTo = resolveStudentLoginRedirect(searchParams.redirectTo, locale);

  if (locale === "fa") {
    redirect(accountLoginPath("fa", searchParams.redirectTo));
  }

  const student = await getStudentUser();
  if (student) {
    redirect(redirectTo);
  }

  return <StudentLoginScreen redirectTo={redirectTo} />;
}
