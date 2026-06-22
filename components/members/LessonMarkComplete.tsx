"use client";

import LessonCompleteNextActions from "@/components/members/LessonCompleteNextActions";

interface LessonMarkCompleteProps {
  lessonId: string;
  completed?: boolean;
  nextHref?: string | null;
  certificateEnabled?: boolean;
  certificatesHref?: string;
  programCertificateHref?: string;
}

export default function LessonMarkComplete({
  lessonId,
  completed = false,
  nextHref = null,
  certificateEnabled = false,
  certificatesHref = "",
  programCertificateHref = "",
}: LessonMarkCompleteProps) {
  return (
    <LessonCompleteNextActions
      lessonId={lessonId}
      completed={completed}
      nextHref={nextHref}
      certificateEnabled={certificateEnabled}
      certificatesHref={certificatesHref}
      programCertificateHref={programCertificateHref}
    />
  );
}
