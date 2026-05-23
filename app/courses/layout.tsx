import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses | Milad X AI",
  description: "AI content creation masterclasses and workshops by Milad",
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
