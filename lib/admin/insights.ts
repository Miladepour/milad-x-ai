import { listBlogPostsAdmin } from "@/lib/blog/store";
import type { ContactSubmission } from "@/lib/contact/types";
import { listCoursesAdmin } from "@/lib/courses/store";
import type { WaitlistSubmission } from "@/lib/courses/types";
import { listEnrollmentsAdmin, listProgramsAdmin } from "@/lib/members/store";
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
  contactSubmissions: ContactSubmission[];
  waitlistSubmissions: WaitlistSubmission[];
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

  const [contactResult, waitlistResult, studentsResult, programs, courses, posts, enrollments] =
    await Promise.all([
      supabase
        .from("contact_submissions")
        .select("*")
        .order("submitted_at", { ascending: false }),
      supabase
        .from("waitlist_submissions")
        .select("*")
        .order("submitted_at", { ascending: false }),
      supabase.from("student_profiles").select("id", { count: "exact", head: true }),
      listProgramsAdmin(),
      listCoursesAdmin(),
      listBlogPostsAdmin(),
      listEnrollmentsAdmin(),
    ]);

  if (contactResult.error) throw new Error(contactResult.error.message);
  if (waitlistResult.error) throw new Error(waitlistResult.error.message);
  if (studentsResult.error) throw new Error(studentsResult.error.message);

  const contactSubmissions = (contactResult.data ?? []).map(contactRowToSubmission);
  const waitlistSubmissions = (waitlistResult.data ?? []).map(waitlistRowToSubmission);

  const unopenedContact = contactSubmissions.filter((c) => !c.openedAt);
  const unopenedWaitlist = waitlistSubmissions.filter((w) => !w.openedAt);
  const activeEnrollments = enrollments.filter((e) => e.status === "active").length;
  const publishedPrograms = programs.filter((p) => p.status === "published").length;
  const publishedCourses = courses.filter((c) => c.publishedAt).length;
  const blogPostsEn = posts.filter((p) => p.locale === "EN").length;
  const blogPostsFa = posts.filter((p) => p.locale === "FA").length;

  return {
    counts: {
      students: studentsResult.count ?? 0,
      activeEnrollments,
      publishedCourses,
      coursesTotal: courses.length,
      publishedPrograms,
      programsTotal: programs.length,
      unopenedContact: unopenedContact.length,
      contactTotal: contactSubmissions.length,
      unopenedWaitlist: unopenedWaitlist.length,
      waitlistTotal: waitlistSubmissions.length,
      blogPosts: posts.length,
      blogPostsEn,
      blogPostsFa,
    },
    contactSubmissions,
    waitlistSubmissions,
    recentUnopenedContact: unopenedContact.slice(0, 5),
    recentUnopenedWaitlist: unopenedWaitlist.slice(0, 5),
    recentBlogPosts: posts.slice(0, 5).map((p) => ({
      slug: p.slug,
      title: p.title,
      locale: p.locale,
      publishedAt: p.publishedAt,
    })),
  };
}
