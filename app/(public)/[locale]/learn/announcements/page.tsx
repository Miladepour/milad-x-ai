import { redirect } from "next/navigation";
import StudentAnnouncementsPage from "@/components/members/StudentAnnouncementsPage";
import { accountLoginPath } from "@/lib/members/paths";
import { listAnnouncementsForStudent } from "@/lib/members/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnAnnouncementsPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];
  const dateLocale = internal === "FA" ? "fa-IR" : "en-GB";

  const student = await getStudentUser();
  if (!student) redirect(accountLoginPath(locale));

  const announcements = await listAnnouncementsForStudent(
    student.user.id,
    student.profile.locale,
    { includeDismissed: false }
  );

  return (
    <StudentAnnouncementsPage
      announcements={announcements}
      dateLocale={dateLocale}
      labels={{
        learnMore: t.memberPortal.learnMore,
        read: t.memberPortal.announcementRead,
        unread: t.memberPortal.announcementUnread,
        pageTitle: t.memberPortal.announcementsPageTitle,
        pageSubtitle: t.memberPortal.announcementsPageSubtitle,
        noAnnouncements: t.memberPortal.noAnnouncements,
        markAllRead: t.memberPortal.markAllAnnouncementsRead,
        filterAll: t.memberPortal.announcementsFilterAll,
        filterUnread: t.memberPortal.announcementsFilterUnread,
        filterRead: t.memberPortal.announcementsFilterRead,
      }}
    />
  );
}
