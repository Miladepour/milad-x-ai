import type { Course, CourseBlock, CourseSection } from "./types";

export interface CurriculumItem {
  title: string;
  description: string;
}

export interface StructureModule {
  id: string;
  title: string;
  lines: string[];
}

export function getSection(
  course: Course,
  id: string
): CourseSection | undefined {
  return course.sections.find((s) => s.id === id);
}

export function getCurriculumItems(section: CourseSection | undefined): CurriculumItem[] {
  if (!section) return [];
  for (const block of section.blocks) {
    if (block.type === "items") return block.items;
  }
  return [];
}

export function parseStructureModules(
  section: CourseSection | undefined
): StructureModule[] {
  if (!section) return [];

  const modules: StructureModule[] = [];
  let current: StructureModule | null = null;

  for (const block of section.blocks) {
    if (block.type === "heading" && block.level === 3) {
      current = {
        id: block.text.toLowerCase().replace(/\s+/g, "-"),
        title: block.text,
        lines: [],
      };
      modules.push(current);
      continue;
    }
    if (!current) continue;
    if (block.type === "paragraph") {
      current.lines.push(block.text);
    }
  }

  return modules;
}

export function getListItems(section: CourseSection | undefined): string[] {
  if (!section) return [];
  for (const block of section.blocks) {
    if (block.type === "list") return block.items;
  }
  return [];
}

export function getParagraphBlocks(section: CourseSection | undefined): string[] {
  if (!section) return [];
  return section.blocks
    .filter((b): b is Extract<CourseBlock, { type: "paragraph" }> => b.type === "paragraph")
    .map((b) => b.text);
}

export function getItemBlocks(section: CourseSection | undefined): CurriculumItem[] {
  return getCurriculumItems(section);
}
