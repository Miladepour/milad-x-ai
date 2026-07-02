import type { Metadata } from "next";
import { redirect } from "next/navigation";
import StudentDeviceBlocked from "@/components/members/StudentDeviceBlocked";
import { accountLoginPath } from "@/lib/members/paths";
import { getStudentDeviceCapMax } from "@/lib/members/device";
import { isValidLocale, urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { translations } from "@/lib/i18n/translations";
import { getStudentUser } from "@/lib/supabase/require-student";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function StudentDeviceBlockedPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = (isValidLocale(params.locale) ? params.locale : "en") as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];

  const student = await getStudentUser();
  if (!student) {
    redirect(accountLoginPath(locale));
  }

  return (
    <div className="pt-20">
      <StudentDeviceBlocked
        locale={locale}
        cap={getStudentDeviceCapMax()}
        labels={{
          title: t.memberPortal.deviceBlockedTitle,
          body: t.memberPortal.deviceBlockedBody,
          contactSupport: t.memberPortal.contactSupport,
          tryAgain: t.memberPortal.deviceBlockedRetry,
          signOut: t.memberPortal.signOut,
        }}
      />
    </div>
  );
}
