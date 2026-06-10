import type { StudentDashboardProgram, UsefulLink } from "@/lib/members/types";

export function collectUsefulLinks(programs: StudentDashboardProgram[]): UsefulLink[] {
  const usefulLinks: UsefulLink[] = [];
  const seen = new Set<string>();

  for (const item of programs) {
    for (const link of item.program.usefulLinks) {
      if (!seen.has(link.url)) {
        seen.add(link.url);
        usefulLinks.push(link);
      }
    }
  }

  return usefulLinks;
}
