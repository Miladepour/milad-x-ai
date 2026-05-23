"use client";

import { useMemo, useState } from "react";
import type { CurriculumItem } from "@/lib/courses/sections";
import type { Locale } from "@/lib/i18n/translations";
import { toLocaleDigits } from "@/lib/i18n/digits";
import { cn } from "@/lib/utils";
import CourseSectionCard from "./CourseSectionCard";

const INITIAL_VISIBLE = 6;

interface LearnTopic {
  id: string;
  title: string;
  description: string;
}

interface CourseWhatYouLearnProps {
  id: string;
  title: string;
  meta: string;
  items: CurriculumItem[];
  lang: Locale;
  showAllLabel: string;
  showLessLabel: string;
}

function TopicAccordion({
  topic,
  isOpen,
  onToggle,
  lang,
}: {
  topic: LearnTopic;
  isOpen: boolean;
  onToggle: () => void;
  lang: Locale;
}) {
  return (
    <div
      className={cn(
        "border rounded-sm overflow-hidden transition-colors",
        isOpen ? "border-orange/40 bg-background/60" : "border-surface bg-background/30"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-start hover:bg-surface/40 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="type-card-body font-dm font-semibold text-cream">
          {toLocaleDigits(topic.title, lang)}
        </span>
        <span
          className={cn(
            "text-orange font-mono text-sm shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-surface/80">
          <p className="type-card-body font-dm text-cream/90 leading-relaxed pt-2">
            {toLocaleDigits(topic.description, lang)}
          </p>
        </div>
      )}
    </div>
  );
}

export default function CourseWhatYouLearn({
  id,
  title,
  meta,
  items,
  lang,
  showAllLabel,
  showLessLabel,
}: CourseWhatYouLearnProps) {
  const topics = useMemo<LearnTopic[]>(
    () =>
      items.map((item, index) => ({
        id: `topic-${index}`,
        title: item.title,
        description: item.description,
      })),
    [items]
  );

  const [showAllTopics, setShowAllTopics] = useState(false);
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(topics.length > 0 ? [topics[0].id] : [])
  );

  const hasMore = topics.length > INITIAL_VISIBLE;
  const visibleTopics = showAllTopics
    ? topics
    : topics.slice(0, INITIAL_VISIBLE);
  function toggle(topicId: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }

  function handleShowAll() {
    setShowAllTopics(true);
  }

  function handleShowLess() {
    setShowAllTopics(false);
    setOpenIds((prev) => {
      const visible = new Set(topics.slice(0, INITIAL_VISIBLE).map((t) => t.id));
      const next = new Set(
        Array.from(prev).filter((openId) => visible.has(openId))
      );
      if (next.size === 0 && topics[0]) next.add(topics[0].id);
      return next;
    });
  }

  return (
    <CourseSectionCard id={id} title={title} meta={toLocaleDigits(meta, lang)}>
      <div className="flex flex-col gap-2">
        {visibleTopics.map((topic) => (
          <TopicAccordion
            key={topic.id}
            topic={topic}
            isOpen={openIds.has(topic.id)}
            onToggle={() => toggle(topic.id)}
            lang={lang}
          />
        ))}
      </div>

      {hasMore && !showAllTopics && (
        <button
          type="button"
          onClick={handleShowAll}
          className="w-full mt-5 group rounded-sm border border-surface/80 bg-background/40 px-4 py-5 hover:border-orange/30 transition-colors duration-200"
        >
          <div
            className="learn-topics-show-bar h-1 w-full rounded-full mb-4"
            aria-hidden
          />
          <span
            className={cn(
              "font-mono text-sm text-orange group-hover:text-cream transition-colors",
              lang === "FA" && "tracking-normal"
            )}
          >
            {showAllLabel}
          </span>
        </button>
      )}

      {hasMore && showAllTopics && (
        <button
          type="button"
          onClick={handleShowLess}
          className={cn(
            "mt-5 font-mono text-sm text-orange hover:text-cream transition-colors",
            lang === "FA" && "tracking-normal"
          )}
        >
          {showLessLabel}
        </button>
      )}
    </CourseSectionCard>
  );
}
