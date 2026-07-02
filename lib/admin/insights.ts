import { listBlogPostsAdminMeta } from "@/lib/blog/store";
import type { ContactSubmission } from "@/lib/contact/types";
import { listCoursesAdmin } from "@/lib/courses/store";
import type { WaitlistSubmission } from "@/lib/courses/types";
import { listProgramsAdmin } from "@/lib/members/store";
import { contactRowToSubmission, waitlistRowToSubmission } from "@/lib/supabase/mappers";
import { createClient } from "@/lib/supabase/server";

export interface AdminInsights {
  counts: {
    students: number;
    activeEnrollments: number;
    publishedCourses: number;
    coursesTotal: number;
    publishedPrograms: number;
    programsTotal: number;
    unopenedContact: number;
    contactTotal: number;
    unopenedWaitlist: number;
    waitlistTotal: number;
    blogPosts: number;
    blogPostsEn: number;
    blogPostsFa: number;
  };
  recentUnopenedContact: ContactSubmission[];
  recentUnopenedWaitlist: WaitlistSubmission[];
  recentBlogPosts: Array<{
    slug: string;
    title: string;
    locale: string;
    publishedAt: string;
  }>;
}

export async function buildAdminInsights(): Promise<AdminInsights> {
  const supabase = createClient();

  const [
    contactTotalResult,
    unopenedContactCountResult,
    waitlistTotalResult,
    unopenedWaitlistCountResult,
    studentsResult,
    activeEnrollmentsResult,
    programs,
    courses,
    blogMeta,
    recentContactResult,
    recentWaitlistResult,
  ] = await Promise.all([
    supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true })
      .is("opened_at", null),
    supabase
      .from("waitlist_submissions")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("waitlist_submissions")
      .select("*", { count: "exact", head: true })
      .is("opened_at", null),
    supabase.from("student_profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("program_enrollments")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    listProgramsAdmin({ programType: "main" }),
    listCoursesAdmin(),
    listBlogPostsAdminMeta(),
    supabase
      .from("contact_submissions")
      .select("*")
      .is("opened_at", null)
      .order("submitted_at", { ascending: false })
      .limit(5),
    supabase
      .from("waitlist_submissions")
      .select("*")
      .is("opened_at", null)
      .order("submitted_at", { ascending: false })
      .limit(5),
  ]);

  if (contactTotalResult.error) throw new Error(contactTotalResult.error.message);
  if (unopenedContactCountResult.error) {
    throw new Error(unopenedContactCountResult.error.message);
  }
  if (waitlistTotalResult.error) throw new Error(waitlistTotalResult.error.message);
  if (unopenedWaitlistCountResult.error) {
    throw new Error(unopenedWaitlistCountResult.error.message);
  }
  if (studentsResult.error) throw new Error(studentsResult.error.message);
  if (activeEnrollmentsResult.error) {
    throw new Error(activeEnrollmentsResult.error.message);
  }
  if (recentContactResult.error) throw new Error(recentContactResult.error.message);
  if (recentWaitlistResult.error) throw new Error(recentWaitlistResult.error.message);

  const publishedPrograms = programs.filter((p) => p.status === "published").length;
  const publishedCourses = courses.filter((c) => c.publishedAt).length;
  const blogPostsEn = blogMeta.filter((p) => p.locale === "EN").length;
  const blogPostsFa = blogMeta.filter((p) => p.locale === "FA").length;

  return {
    counts: {
      students: studentsResult.count ?? 0,
      activeEnrollments: activeEnrollmentsResult.count ?? 0,
      publishedCourses,
      coursesTotal: courses.length,
      publishedPrograms,
      programsTotal: programs.length,
      unopenedContact: unopenedContactCountResult.count ?? 0,
      contactTotal: contactTotalResult.count ?? 0,
      unopenedWaitlist: unopenedWaitlistCountResult.count ?? 0,
      waitlistTotal: waitlistTotalResult.count ?? 0,
      blogPosts: blogMeta.length,
      blogPostsEn,
      blogPostsFa,
    },
    recentUnopenedContact: (recentContactResult.data ?? []).map(contactRowToSubmission),
    recentUnopenedWaitlist: (recentWaitlistResult.data ?? []).map(waitlistRowToSubmission),
    recentBlogPosts: blogMeta.slice(0, 5).map((p) => ({
      slug: p.slug,
      title: p.title,
      locale: p.locale,
      publishedAt: p.publishedAt,
    })),
  };
}
