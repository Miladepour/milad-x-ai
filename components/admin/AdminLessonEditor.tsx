"use client";

import { useEffect, useState } from "react";
import RichTextEditor from "@/components/shared/RichTextEditor";
import type {
  LessonType,
  ProgramLesson,
  QuizQuestionPayload,
} from "@/lib/members/types";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
        {label}
      </span>
      {children}
    </label>
  );
}

function emptyQuestion(index: number): QuizQuestionPayload {
  return {
    promptEn: "",
    promptFa: "",
    explanationEn: "",
    explanationFa: "",
    sortOrder: index,
    options: [
      { labelEn: "", labelFa: "", isCorrect: true, sortOrder: 0 },
      { labelEn: "", labelFa: "", isCorrect: false, sortOrder: 1 },
    ],
  };
}

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: "Video",
  text: "Text",
  quiz: "Quiz",
};

interface AdminLessonEditorProps {
  lesson: ProgramLesson;
  index: number;
  total: number;
  onImageUpload: (file: File) => Promise<string>;
  onSave: (patch: Partial<ProgramLesson> & { published?: boolean }) => Promise<void>;
  onSaveQuiz: (questions: QuizQuestionPayload[]) => Promise<void>;
  onLoadQuiz: () => Promise<QuizQuestionPayload[]>;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}

export default function AdminLessonEditor({
  lesson,
  index,
  total,
  onImageUpload,
  onSave,
  onSaveQuiz,
  onLoadQuiz,
  onMove,
  onDelete,
}: AdminLessonEditorProps) {
  const [titleEn, setTitleEn] = useState(lesson.titleEn);
  const [titleFa, setTitleFa] = useState(lesson.titleFa);
  const [bodyEn, setBodyEn] = useState(lesson.bodyEn);
  const [bodyFa, setBodyFa] = useState(lesson.bodyFa);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl ?? "");
  const [published, setPublished] = useState(!!lesson.publishedAt);
  const [questions, setQuestions] = useState<QuizQuestionPayload[]>([]);
  const [quizLoaded, setQuizLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitleEn(lesson.titleEn);
    setTitleFa(lesson.titleFa);
    setBodyEn(lesson.bodyEn);
    setBodyFa(lesson.bodyFa);
    setVideoUrl(lesson.videoUrl ?? "");
    setPublished(!!lesson.publishedAt);
    setQuizLoaded(false);
    setQuestions([]);
  }, [lesson]);

  useEffect(() => {
    if (lesson.lessonType !== "quiz" || quizLoaded) return;
    void onLoadQuiz()
      .then((loaded) => {
        setQuestions(loaded.length > 0 ? loaded : [emptyQuestion(0)]);
        setQuizLoaded(true);
      })
      .catch(() => {
        setQuestions([emptyQuestion(0)]);
        setQuizLoaded(true);
      });
  }, [lesson.id, lesson.lessonType, onLoadQuiz, quizLoaded]);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        titleEn,
        titleFa,
        bodyEn,
        bodyFa,
        videoUrl: lesson.lessonType === "video" ? videoUrl || null : null,
        published,
      });
      if (lesson.lessonType === "quiz") {
        await onSaveQuiz(questions);
      }
    } finally {
      setSaving(false);
    }
  }

  function updateQuestion(questionIndex: number, patch: Partial<QuizQuestionPayload>) {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex ? { ...question, ...patch } : question
      )
    );
  }

  function updateOption(
    questionIndex: number,
    optionIndex: number,
    patch: Partial<QuizQuestionPayload["options"][number]>
  ) {
    setQuestions((current) =>
      current.map((question, qIndex) => {
        if (qIndex !== questionIndex) return question;
        return {
          ...question,
          options: question.options.map((option, oIndex) =>
            oIndex === optionIndex ? { ...option, ...patch } : option
          ),
        };
      })
    );
  }

  function setCorrectOption(questionIndex: number, optionIndex: number) {
    setQuestions((current) =>
      current.map((question, qIndex) => {
        if (qIndex !== questionIndex) return question;
        return {
          ...question,
          options: question.options.map((option, oIndex) => ({
            ...option,
            isCorrect: oIndex === optionIndex,
          })),
        };
      })
    );
  }

  return (
    <li className="border border-surface bg-background/30 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-orange">#{index + 1}</span>
        <span className="rounded-full border border-orange/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-orange">
          {LESSON_TYPE_LABELS[lesson.lessonType]}
        </span>
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(-1)}
          className="font-mono text-xs text-cream/50 hover:text-orange disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={index >= total - 1}
          onClick={() => onMove(1)}
          className="font-mono text-xs text-cream/50 hover:text-orange disabled:opacity-30"
        >
          ↓
        </button>
        <label className="ms-auto flex items-center gap-2 font-mono text-xs text-cream/70">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title (English)">
            <input
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="form-field"
              placeholder="Lesson title in English"
            />
          </Field>
          <Field label="Title (Farsi)">
            <input
              value={titleFa}
              onChange={(e) => setTitleFa(e.target.value)}
              className="form-field"
              placeholder="عنوان درس به فارسی"
              dir="rtl"
            />
          </Field>
        </div>

        {lesson.lessonType === "video" && (
          <>
            <Field label="Video URL (YouTube, Vimeo, Bunny, or direct link)">
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="form-field font-mono text-xs"
                placeholder="https://iframe.mediadelivery.net/embed/… or Bunny play/HLS URL"
              />
            </Field>
            <Field label="Materials below video (English)">
              <RichTextEditor
                key={`${lesson.id}-body-en`}
                value={bodyEn}
                onChange={setBodyEn}
                onImageUpload={onImageUpload}
                minHeightClassName="min-h-[180px]"
              />
            </Field>
            <Field label="Materials below video (Farsi)">
              <RichTextEditor
                key={`${lesson.id}-body-fa`}
                value={bodyFa}
                onChange={setBodyFa}
                onImageUpload={onImageUpload}
                minHeightClassName="min-h-[180px]"
              />
            </Field>
          </>
        )}

        {lesson.lessonType === "text" && (
          <>
            <Field label="Lesson content (English)">
              <RichTextEditor
                key={`${lesson.id}-text-en`}
                value={bodyEn}
                onChange={setBodyEn}
                onImageUpload={onImageUpload}
                minHeightClassName="min-h-[240px]"
              />
            </Field>
            <Field label="Lesson content (Farsi)">
              <RichTextEditor
                key={`${lesson.id}-text-fa`}
                value={bodyFa}
                onChange={setBodyFa}
                onImageUpload={onImageUpload}
                minHeightClassName="min-h-[240px]"
              />
            </Field>
          </>
        )}

        {lesson.lessonType === "quiz" && (
          <>
            <Field label="Quiz intro (English)">
              <RichTextEditor
                key={`${lesson.id}-quiz-en`}
                value={bodyEn}
                onChange={setBodyEn}
                onImageUpload={onImageUpload}
                minHeightClassName="min-h-[120px]"
              />
            </Field>
            <Field label="Quiz intro (Farsi)">
              <RichTextEditor
                key={`${lesson.id}-quiz-fa`}
                value={bodyFa}
                onChange={setBodyFa}
                onImageUpload={onImageUpload}
                minHeightClassName="min-h-[120px]"
              />
            </Field>

            <div className="flex flex-col gap-4 border border-surface/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-cream/45">
                  Quiz questions (100% required to pass)
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setQuestions((current) => [...current, emptyQuestion(current.length)])
                  }
                  className="border border-orange/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-orange hover:bg-orange hover:text-background"
                >
                  Add question
                </button>
              </div>

              {questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="grid gap-3 border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-dm text-sm font-medium text-cream">
                      Question {questionIndex + 1}
                    </p>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setQuestions((current) =>
                            current.filter((_, index) => index !== questionIndex)
                          )
                        }
                        className="font-mono text-[10px] uppercase tracking-widest text-cream/50 hover:text-orange"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Question (English)">
                      <textarea
                        value={question.promptEn}
                        onChange={(e) =>
                          updateQuestion(questionIndex, { promptEn: e.target.value })
                        }
                        className="form-field min-h-20"
                      />
                    </Field>
                    <Field label="Question (Farsi)">
                      <textarea
                        value={question.promptFa}
                        onChange={(e) =>
                          updateQuestion(questionIndex, { promptFa: e.target.value })
                        }
                        className="form-field min-h-20"
                        dir="rtl"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="grid gap-2 rounded-lg border border-white/[0.06] p-3 md:grid-cols-[auto_1fr_1fr]"
                      >
                        <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cream/60">
                          <input
                            type="radio"
                            name={`correct-${lesson.id}-${questionIndex}`}
                            checked={option.isCorrect}
                            onChange={() => setCorrectOption(questionIndex, optionIndex)}
                          />
                          Correct
                        </label>
                        <input
                          value={option.labelEn}
                          onChange={(e) =>
                            updateOption(questionIndex, optionIndex, {
                              labelEn: e.target.value,
                            })
                          }
                          className="form-field"
                          placeholder={`Option ${optionIndex + 1} EN`}
                        />
                        <input
                          value={option.labelFa}
                          onChange={(e) =>
                            updateOption(questionIndex, optionIndex, {
                              labelFa: e.target.value,
                            })
                          }
                          className="form-field"
                          placeholder={`گزینه ${optionIndex + 1}`}
                          dir="rtl"
                        />
                      </div>
                    ))}
                    {question.options.length < 4 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateQuestion(questionIndex, {
                            options: [
                              ...question.options,
                              {
                                labelEn: "",
                                labelFa: "",
                                isCorrect: false,
                                sortOrder: question.options.length,
                              },
                            ],
                          })
                        }
                        className="self-start font-mono text-[10px] uppercase tracking-widest text-cream/50 hover:text-orange"
                      >
                        Add option
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="border border-orange px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-orange hover:bg-orange hover:text-background disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save lesson"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="border border-surface px-3 py-1.5 font-mono text-xs text-cream/50 hover:text-orange"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
