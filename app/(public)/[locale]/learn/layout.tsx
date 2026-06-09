import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { accountLoginPath } from "@/lib/members/paths";
import { syncExpiredEnrollments } from "@/lib/members/store";
import { isValidLocale, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isValidLocale(params.locale)) {
    redirect("/");
  }

  const locale = params.locale as UrlLocale;
  const student = await getStudentUser();

  if (!student) {
    redirect(accountLoginPath(locale));
  }

  await syncExpiredEnrollments();

  return <>{children}</>;
}
