import { createAdminDbClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";
import { resolveLessonBody } from "@/lib/members/lesson-localized";
import type { LocaleCode } from "@/lib/supabase/database.types";
import type {
  LessonQuizQuestion,
  LessonQuizQuestionStudent,
  LessonQuizSubmitResult,
  ProgramLesson,
  QuizQuestionPayload,
} from "./types";

interface QuizQuestionRow {
  id: string;
  lesson_id: string;
  sort_order: number;
  prompt_en: string;
  prompt_fa: string;
  explanation_en: string;
  explanation_fa: string;
}

interface QuizOptionRow {
  id: string;
  question_id: string;
  sort_order: number;
  label_en: string;
  label_fa: string;
  is_correct: boolean;
}

function resolvePrompt(row: QuizQuestionRow, locale: LocaleCode): string {
  if (locale === "FA") return row.prompt_fa.trim() || row.prompt_en.trim();
  return row.prompt_en.trim() || row.prompt_fa.trim();
}

function resolveLabel(row: QuizOptionRow, locale: LocaleCode): string {
  if (locale === "FA") return row.label_fa.trim() || row.label_en.trim();
  return row.label_en.trim() || row.label_fa.trim();
}

function resolveExplanation(row: QuizQuestionRow, locale: LocaleCode): string {
  if (locale === "FA") return row.explanation_fa.trim() || row.explanation_en.trim();
  return row.explanation_en.trim() || row.explanation_fa.trim();
}

async function loadQuizQuestionsAdmin(lessonId: string): Promise<LessonQuizQuestion[]> {
  const supabase = createAdminDbClient();
  const { data: questions, error } = await supabase
    .from("lesson_quiz_questions")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  const questionRows = (questions ?? []) as QuizQuestionRow[];
  if (questionRows.length === 0) return [];

  const questionIds = questionRows.map((row) => row.id);
  const { data: options, error: optionsError } = await supabase
    .from("lesson_quiz_options")
    .select("*")
    .in("question_id", questionIds)
    .order("sort_order", { ascending: true });

  if (optionsError) throw new Error(optionsError.message);

  const optionsByQuestion = new Map<string, QuizOptionRow[]>();
  for (const row of (options ?? []) as QuizOptionRow[]) {
    const list = optionsByQuestion.get(row.question_id) ?? [];
    list.push(row);
    optionsByQuestion.set(row.question_id, list);
  }

  return questionRows.map((row) => ({
    id: row.id,
    lessonId: row.lesson_id,
    sortOrder: row.sort_order,
    promptEn: row.prompt_en,
    promptFa: row.prompt_fa,
    explanationEn: row.explanation_en,
    explanationFa: row.explanation_fa,
    options: (optionsByQuestion.get(row.id) ?? []).map((option) => ({
      id: option.id,
      questionId: option.question_id,
      sortOrder: option.sort_order,
      labelEn: option.label_en,
      labelFa: option.label_fa,
      isCorrect: option.is_correct,
    })),
  }));
}

export async function getQuizForLessonAdmin(lessonId: string): Promise<LessonQuizQuestion[]> {
  return loadQuizQuestionsAdmin(lessonId);
}

export async function saveQuizForLessonAdmin(
  lessonId: string,
  questions: QuizQuestionPayload[]
): Promise<LessonQuizQuestion[]> {
  const supabase = createAdminDbClient();

  const { error: deleteQuestionsError } = await supabase
    .from("lesson_quiz_questions")
    .delete()
    .eq("lesson_id", lessonId);

  if (deleteQuestionsError) throw new Error(deleteQuestionsError.message);

  for (let questionIndex = 0; questionIndex < questions.length; questionIndex += 1) {
    const question = questions[questionIndex];
    const { data: questionRow, error: questionError } = await supabase
      .from("lesson_quiz_questions")
      .insert({
        lesson_id: lessonId,
        sort_order: question.sortOrder ?? questionIndex,
        prompt_en: question.promptEn.trim(),
        prompt_fa: question.promptFa.trim(),
        explanation_en: question.explanationEn?.trim() ?? "",
        explanation_fa: question.explanationFa?.trim() ?? "",
      })
      .select("*")
      .single();

    if (questionError) throw new Error(questionError.message);

    const options = question.options.slice(0, 4);
    if (options.length < 2) {
      throw new Error("Each quiz question needs at least 2 options.");
    }
    if (!options.some((option) => option.isCorrect)) {
      throw new Error("Each quiz question needs one correct option.");
    }

    const { error: optionsError } = await supabase.from("lesson_quiz_options").insert(
      options.map((option, optionIndex) => ({
        question_id: (questionRow as QuizQuestionRow).id,
        sort_order: option.sortOrder ?? optionIndex,
        label_en: option.labelEn.trim(),
        label_fa: option.labelFa.trim(),
        is_correct: option.isCorrect,
      }))
    );

    if (optionsError) throw new Error(optionsError.message);
  }

  return loadQuizQuestionsAdmin(lessonId);
}

export async function getQuizForStudent(
  lessonId: string,
  locale: LocaleCode
): Promise<LessonQuizQuestionStudent[]> {
  const supabase = createClient();
  const { data: questions, error } = await supabase
    .from("lesson_quiz_questions")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  const questionRows = (questions ?? []) as QuizQuestionRow[];
  if (questionRows.length === 0) return [];

  const questionIds = questionRows.map((row) => row.id);
  const { data: options, error: optionsError } = await supabase
    .from("lesson_quiz_options")
    .select("id, question_id, sort_order, label_en, label_fa")
    .in("question_id", questionIds)
    .order("sort_order", { ascending: true });

  if (optionsError) throw new Error(optionsError.message);

  const optionsByQuestion = new Map<string, QuizOptionRow[]>();
  for (const row of (options ?? []) as QuizOptionRow[]) {
    const list = optionsByQuestion.get(row.question_id) ?? [];
    list.push(row);
    optionsByQuestion.set(row.question_id, list);
  }

  return questionRows.map((row) => ({
    id: row.id,
    sortOrder: row.sort_order,
    prompt: resolvePrompt(row, locale),
    options: (optionsByQuestion.get(row.id) ?? []).map((option) => ({
      id: option.id,
      sortOrder: option.sort_order,
      label: resolveLabel(option, locale),
    })),
  }));
}

export async function submitQuizAttempt(
  userId: string,
  lesson: ProgramLesson,
  locale: LocaleCode,
  answers: Record<string, string>
): Promise<LessonQuizSubmitResult> {
  const admin = createAdminDbClient();
  const questions = await loadQuizQuestionsAdmin(lesson.id);
  if (questions.length === 0) {
    throw new Error("This quiz has no questions yet.");
  }

  const results: LessonQuizSubmitResult["results"] = [];
  let correctCount = 0;

  for (const question of questions) {
    const selectedOptionId = answers[question.id] ?? null;
    const correctOption = question.options.find((option) => option.isCorrect);
    if (!correctOption) {
      throw new Error("Quiz configuration error: missing correct option.");
    }

    const selectedOption = question.options.find((option) => option.id === selectedOptionId);
    const isCorrect = selectedOptionId === correctOption.id;
    if (isCorrect) correctCount += 1;

    const prompt =
      locale === "FA"
        ? question.promptFa.trim() || question.promptEn.trim()
        : question.promptEn.trim() || question.promptFa.trim();
    const correctLabel =
      locale === "FA"
        ? correctOption.labelFa.trim() || correctOption.labelEn.trim()
        : correctOption.labelEn.trim() || correctOption.labelFa.trim();
    const selectedLabel = selectedOption
      ? locale === "FA"
        ? selectedOption.labelFa.trim() || selectedOption.labelEn.trim()
        : selectedOption.labelEn.trim() || selectedOption.labelFa.trim()
      : null;
    const explanation =
      locale === "FA"
        ? question.explanationFa.trim() || question.explanationEn.trim()
        : question.explanationEn.trim() || question.explanationFa.trim();

    results.push({
      questionId: question.id,
      prompt,
      selectedOptionId,
      correctOptionId: correctOption.id,
      correctLabel,
      selectedLabel,
      isCorrect,
      explanation,
    });
  }

  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercent === 100;

  const supabase = createClient();
  const { error: attemptError } = await supabase.from("lesson_quiz_attempts").insert({
    student_id: userId,
    lesson_id: lesson.id,
    score_percent: scorePercent,
    passed,
    answers,
  });

  if (attemptError) throw new Error(attemptError.message);

  return {
    scorePercent,
    passed,
    totalQuestions: questions.length,
    correctCount,
    results,
  };
}

export function getQuizIntro(lesson: ProgramLesson, locale: LocaleCode): string {
  return resolveLessonBody(lesson, locale);
}
