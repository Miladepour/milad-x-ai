import type { Metadata } from "next";
import { redirect } from "next/navigation";
import StudentLoginScreen from "@/components/members/StudentLoginScreen";
import {
  accountLoginPath,
  learnPath,
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

  if (locale === "fa") {
    redirect(accountLoginPath("fa"));
  }

  const student = await getStudentUser();
  if (student) {
    redirect(learnPath(locale));
  }

  const redirectTo = resolveStudentLoginRedirect(searchParams.redirectTo, locale);

  return <StudentLoginScreen redirectTo={redirectTo} />;
}
