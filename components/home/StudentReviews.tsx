import type { ComponentProps } from "react";
import StudentReviewsSection from "@/components/reviews/StudentReviewsSection";

export default function StudentReviews(
  props: ComponentProps<typeof StudentReviewsSection>
) {
  return <StudentReviewsSection {...props} accentTitles />;
}
