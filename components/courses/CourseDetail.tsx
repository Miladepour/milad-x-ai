"use client";

import { notFound } from "next/navigation";
import { COURSES_BASE_PATH, getCourseBySlug, getWaitlistPath } from "@/lib/courses";
import {
  getCurriculumItems,
  getItemBlocks,
  getListItems,
  getParagraphBlocks,
  getSection,
  parseStructureModules,
} from "@/lib/courses/sections";
import { toLocaleDigits } from "@/lib/i18n/digits";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import CourseDetailHero from "./CourseDetailHero";
import CourseFaqAccordion from "./CourseFaqAccordion";
import CourseIncludes from "./CourseIncludes";
import CoursePurchaseSidebar from "./CoursePurchaseSidebar";
import CourseSectionCard from "./CourseSectionCard";
import CourseSectionNav, { type CourseSectionNavLink } from "./CourseSectionNav";
import CourseStructureAccordion from "./CourseStructureAccordion";
import CourseWhatYouLearn from "./CourseWhatYouLearn";

interface CourseDetailProps {
  slug: string;
}

export default function CourseDetail({ slug }: CourseDetailProps) {
  const { lang, href } = useLanguage();
  const t = useTranslation();
  const course = getCourseBySlug(slug, lang);
  const p = t.coursesPage;
  const d = p.detail;

  if (!course) notFound();

  const statusLabel = p.statusLabels[course.status];

  const introSection = getSection(course, "intro");
  const structureSection = getSection(course, "structure");
  const curriculumSection = getSection(course, "curriculum");
  const audienceSection = getSection(course, "audience");
  const prerequisitesSection = getSection(course, "prerequisites");
  const outcomeSection = getSection(course, "outcome");

  const curriculumItems = getCurriculumItems(curriculumSection);
  const structureModules = parseStructureModules(structureSection);

  const contentMeta = d.contentMeta
    .replace("{parts}", toLocaleDigits(String(course.meta.partsCount), lang))
    .replace("{topics}", toLocaleDigits(String(course.insights.topicsCount), lang))
    .replace("{hours}", toLocaleDigits(course.meta.totalHours, lang));

  const sectionNavLinks: CourseSectionNavLink[] = [
    { id: "curriculum", label: d.whatYouLearn },
    { id: "structure", label: d.courseContent },
    { id: "includes", label: d.courseIncludes },
    { id: "audience", label: d.whoIsFor },
    { id: "prerequisites", label: d.requirements },
    ...(introSection ? [{ id: "intro", label: d.aboutCourse }] : []),
    ...(outcomeSection ? [{ id: "outcome", label: d.whatYouGain }] : []),
    ...(course.faq.length > 0 ? [{ id: "faq", label: d.faq }] : []),
  ];

  return (
    <div className="flex-1 w-full bg-background text-cream">
      <CourseDetailHero
        course={course}
        lang={lang}
        statusLabel={statusLabel}
        nav={{ home: p.home, courses: p.courses }}
        homeHref={href("/")}
        coursesHref={href(COURSES_BASE_PATH)}
        detail={d}
      />

      <CourseSectionNav links={sectionNavLinks} ariaLabel={d.navLabel} lang={lang} />

      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 py-10 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-10 lg:gap-12 items-start">
          <aside className="order-1 lg:order-2">
            <CoursePurchaseSidebar
              course={course}
              lang={lang}
              waitlistHref={href(getWaitlistPath(course.slug))}
              coursesIndexHref={href(COURSES_BASE_PATH)}
              labels={{
                joinWaitingList: p.joinWaitingList,
                dateLabel: p.dateLabel,
                session1: d.session1,
                session2: d.session2,
                sessionHours: d.sessionHours,
                priceLabel: p.priceLabel,
                sidebarHighlights: d.sidebarHighlights,
                allCourses: d.allCourses,
                insights: p.insights,
              }}
            />
          </aside>

          <main className="order-2 lg:order-1 flex flex-col gap-8 min-w-0">
            <CourseWhatYouLearn
              id="curriculum"
              title={d.whatYouLearn}
              meta={contentMeta}
              items={curriculumItems}
              lang={lang}
              showAllLabel={d.showAll}
              showLessLabel={d.showLess}
            />

            <CourseStructureAccordion
              id="structure"
              title={d.courseContent}
              meta={contentMeta}
              modules={structureModules}
              lang={lang}
              expandAllLabel={d.expandAll}
              collapseAllLabel={d.collapseAll}
            />

            <CourseIncludes
              id="includes"
              title={d.courseIncludes}
              items={course.includes}
              lang={lang}
            />

            <CourseSectionCard id="audience" title={d.whoIsFor}>
              <ul className="space-y-2">
                {getListItems(audienceSection).map((item) => (
                  <li
                    key={item}
                    className="type-card-body font-dm text-cream flex gap-3 leading-relaxed"
                  >
                    <span className="text-orange shrink-0 mt-1">◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CourseSectionCard>

            <CourseSectionCard id="prerequisites" title={d.requirements}>
              <div className="space-y-4">
                {getParagraphBlocks(prerequisitesSection).map((text) => (
                  <p key={text} className="type-section-body font-dm text-cream leading-relaxed">
                    {toLocaleDigits(text, lang)}
                  </p>
                ))}
                <ul className="space-y-4">
                  {getItemBlocks(prerequisitesSection).map((item) => (
                    <li
                      key={item.title}
                      className="border border-surface rounded-sm p-4 bg-background/40"
                    >
                      <h4 className="type-course-block-h4 font-dm font-semibold text-cream mb-1">
                        {toLocaleDigits(item.title, lang)}
                      </h4>
                      <p className="type-card-body font-dm text-cream/90 leading-relaxed">
                        {toLocaleDigits(item.description, lang)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </CourseSectionCard>

            {introSection && (
              <CourseSectionCard id="intro" title={d.aboutCourse}>
                <div className="space-y-4">
                  {getParagraphBlocks(introSection).map((text) => (
                    <p
                      key={text}
                      className="type-section-body font-dm text-cream leading-relaxed"
                    >
                      {toLocaleDigits(text, lang)}
                    </p>
                  ))}
                </div>
              </CourseSectionCard>
            )}

            {outcomeSection && (
              <CourseSectionCard id="outcome" title={d.whatYouGain}>
                <div className="space-y-4">
                  {getParagraphBlocks(outcomeSection).map((text) => (
                    <p
                      key={text}
                      className="type-section-body font-dm text-cream leading-relaxed"
                    >
                      {toLocaleDigits(text, lang)}
                    </p>
                  ))}
                </div>
              </CourseSectionCard>
            )}

            {course.faq.length > 0 && (
              <CourseFaqAccordion
                id="faq"
                title={d.faq}
                items={course.faq}
                lang={lang}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
