"use client";

import StudentPortalButton from "@/components/members/StudentPortalButton";

interface CertificateLinkedInButtonProps {
  href: string;
  label: string;
}

export default function CertificateLinkedInButton({
  href,
  label,
}: CertificateLinkedInButtonProps) {
  return (
    <StudentPortalButton href={href} variant="primary" external>
      {label}
    </StudentPortalButton>
  );
}
