import type { CourseLocaleContent } from "@/lib/courses/cms-types";
import type { BlogPost } from "@/lib/blog/types";
import type { ContactSubmission } from "@/lib/contact/types";
import type { Course, CourseStatus } from "@/lib/courses/types";
import type { WaitlistSubmission } from "@/lib/courses/types";
import type {
  BlogPostRow,
  ContactSubmissionRow,
  CourseLocaleRow,
  CourseRow,
  WaitlistSubmissionRow,
} from "./database.types";

export function blogRowToPost(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    date: row.date,
    publishedAt: row.published_at,
    locale: row.locale,
  };
}

export function blogPostToRow(
  post: BlogPost
): Omit<BlogPostRow, "id" | "created_at" | "updated_at"> {
  return {
    slug: post.slug,
    locale: post.locale,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    date: post.date,
    published_at: post.publishedAt,
  };
}

export function contactRowToSubmission(row: ContactSubmissionRow): ContactSubmission {
  return {
    fullName: row.full_name,
    email: row.email,
    mobile: row.mobile,
    country: row.country,
    inquiryType: row.inquiry_type,
    message: row.message,
    locale: row.locale,
    submittedAt: row.submitted_at,
  };
}

export function waitlistRowToSubmission(
  row: WaitlistSubmissionRow
): WaitlistSubmission {
  return {
    courseSlug: row.course_slug,
    fullName: row.full_name,
    email: row.email,
    mobile: row.mobile,
    country: row.country,
    locale: row.locale,
    submittedAt: row.submitted_at,
  };
}

export function joinCourseRow(
  course: CourseRow,
  localeRow: CourseLocaleRow
): Course {
  const content = localeRow.content as unknown as CourseLocaleContent;
  return {
    slug: course.slug,
    listTitle: localeRow.list_title,
    title: localeRow.title,
    subtitle: localeRow.subtitle,
    excerpt: localeRow.excerpt,
    status: localeRow.status as CourseStatus,
    date: localeRow.date,
    coverImage: course.cover_image,
    priceUsd: Number(course.price_usd),
    meta: content.meta,
    includes: content.includes ?? [],
    insights: content.insights,
    faq: content.faq ?? [],
    sections: content.sections ?? [],
  };
}
