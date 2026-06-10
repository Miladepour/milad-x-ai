import { redirect } from "next/navigation";
import StudentGlassCard from "@/components/members/StudentGlassCard";
import StudentPortalButton from "@/components/members/StudentPortalButton";
import StudentUpcomingCourseCard from "@/components/members/StudentUpcomingCourseCard";
import { accountLoginPath } from "@/lib/members/paths";
import { getCourses } from "@/lib/courses/store";
import { urlLocaleToInternal, type UrlLocale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/paths";
import { getStudentUser } from "@/lib/supabase/require-student";
import { translations } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export default async function LearnUpcomingCoursesPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale as UrlLocale;
  const internal = urlLocaleToInternal(locale);
  const t = translations[internal];

  const student = await getStudentUser();
  if (!student) redirect(accountLoginPath(locale));

  const courses = await getCourses(internal);
  const upcomingCourses = courses.filter((course) => course.status !== "Closed");
  const courseStatusLabels = t.coursesPage.statusLabels;

  return (
    <div className="flex flex-col gap-5 pb-10 sm:gap-6">
      <StudentGlassCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="font-dm text-2xl font-semibold text-cream sm:text-3xl">
              {t.memberPortal.navUpcomingCourses}
            </h1>
            <p className="mt-2 font-dm text-sm text-cream/60">
              {t.memberPortal.upcomingCoursesSubtitle}
            </p>
          </div>
          <StudentPortalButton
            href={localizedPath("/courses", locale)}
            variant="secondary"
            className="shrink-0"
          >
            {t.memberPortal.viewAllCourses}
          </StudentPortalButton>
        </div>
      </StudentGlassCard>

      <StudentGlassCard>
        {upcomingCourses.length === 0 ? (
          <p className="font-dm text-sm text-cream/55">{t.memberPortal.noUpcomingCourses}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingCourses.map((course) => (
              <li key={course.slug} className="min-h-0">
                <StudentUpcomingCourseCard
                  href={localizedPath(`/courses/${course.slug}`, locale)}
                  title={course.listTitle}
                  excerpt={course.excerpt}
                  date={course.date}
                  statusLabel={courseStatusLabels[course.status]}
                  isLive={course.status === "Live"}
                  coverImage={course.coverImage}
                  viewLabel={t.memberPortal.viewCourse}
                />
              </li>
            ))}
          </ul>
        )}
      </StudentGlassCard>
    </div>
  );
}
