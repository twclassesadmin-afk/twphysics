import { db, nextId } from "./db";
import { hasEnded, hasStarted } from "../time-gate";
import type { Exam, ExamAnswer, ExamAttempt, Question, QuestionOption } from "./types";

export type NewQuestionInput = {
  text: string;
  options: QuestionOption;
  correctOptionIndex: 0 | 1 | 2 | 3;
  marks: number;
  negativeMarks: number;
};

export function listExams(): Exam[] {
  return db.exams;
}

export function listExamsByBatch(batchId: string): Exam[] {
  return db.exams.filter((e) => e.batchId === batchId);
}

export function getExam(id: string): Exam | undefined {
  return db.exams.find((e) => e.id === id);
}

export function listQuestionsFull(examId: string): Question[] {
  return db.questions.filter((q) => q.examId === examId);
}

// Never send `correctOptionIndex` to a student's client before/while they're
// attempting an exam — this is a distinct function on purpose, not a
// "hide field" flag on the admin/tutor one.
export function listQuestionsForAttempt(examId: string): Omit<Question, "correctOptionIndex">[] {
  return db.questions
    .filter((q) => q.examId === examId)
    .map((q) => ({ id: q.id, examId: q.examId, text: q.text, options: q.options, marks: q.marks, negativeMarks: q.negativeMarks }));
}

export function createExam(input: {
  title: string;
  subject: string;
  batchId: string;
  batchName: string;
  scheduledAt: string;
  durationMinutes: number;
  createdBy: string;
  questions: NewQuestionInput[];
}): Exam {
  const exam: Exam = {
    id: nextId("exam"),
    title: input.title,
    subject: input.subject,
    batchId: input.batchId,
    batchName: input.batchName,
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes,
    totalMarks: input.questions.reduce((sum, q) => sum + q.marks, 0),
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
    publishedAt: null,
  };
  db.exams.push(exam);
  for (const q of input.questions) {
    const question: Question = { id: nextId("q"), examId: exam.id, ...q };
    db.questions.push(question);
  }
  return exam;
}

export function getAttempt(examId: string, studentId: string): ExamAttempt | undefined {
  return db.examAttempts.find((a) => a.examId === examId && a.studentId === studentId);
}

export function listAttemptsForExam(examId: string): ExamAttempt[] {
  return db.examAttempts.filter((a) => a.examId === examId);
}

export type StartAttemptResult =
  | { ok: true; attempt: ExamAttempt }
  | { ok: false; error: "not_started" | "ended" };

export function startAttempt(examId: string, studentId: string): StartAttemptResult {
  const exam = db.exams.find((e) => e.id === examId);
  if (!exam) return { ok: false, error: "not_started" };

  const existing = getAttempt(examId, studentId);
  if (existing) return { ok: true, attempt: existing };

  if (!hasStarted(exam.scheduledAt)) return { ok: false, error: "not_started" };
  if (hasEnded(exam.scheduledAt, exam.durationMinutes)) return { ok: false, error: "ended" };

  const questions = listQuestionsFull(examId);
  const attempt: ExamAttempt = {
    id: nextId("attempt"),
    examId,
    studentId,
    answers: questions.map((q) => ({ questionId: q.id, selectedOptionIndex: null })),
    startedAt: new Date().toISOString(),
    submittedAt: null,
    autoSubmitted: false,
    score: null,
    computedAt: null,
  };
  db.examAttempts.push(attempt);
  return { ok: true, attempt };
}

export type SubmitAttemptResult =
  | { ok: true; attempt: ExamAttempt }
  | { ok: false; error: "not_started" | "no_attempt" | "already_submitted" };

export function submitAttempt(
  examId: string,
  studentId: string,
  answers: ExamAnswer[],
  autoSubmitted = false,
): SubmitAttemptResult {
  const exam = db.exams.find((e) => e.id === examId);
  const attempt = getAttempt(examId, studentId);
  if (!exam) return { ok: false, error: "no_attempt" };
  if (!attempt) return { ok: false, error: "no_attempt" };
  if (attempt.submittedAt) return { ok: false, error: "already_submitted" };
  if (!hasStarted(exam.scheduledAt)) return { ok: false, error: "not_started" };

  const questions = listQuestionsFull(examId);
  let score = 0;
  for (const question of questions) {
    const answer = answers.find((a) => a.questionId === question.id);
    if (!answer || answer.selectedOptionIndex === null) continue;
    if (answer.selectedOptionIndex === question.correctOptionIndex) {
      score += question.marks;
    } else {
      score -= question.negativeMarks;
    }
  }

  attempt.answers = answers;
  attempt.submittedAt = new Date().toISOString();
  attempt.autoSubmitted = autoSubmitted;
  attempt.score = score;
  attempt.computedAt = new Date().toISOString();
  return { ok: true, attempt };
}

export type ExamResultRow = {
  studentId: string;
  status: "not_started" | "in_progress" | "submitted" | "auto_submitted";
  score: number | null;
};

export function getExamResults(examId: string, studentIds: string[]): ExamResultRow[] {
  return studentIds.map((studentId) => {
    const attempt = getAttempt(examId, studentId);
    if (!attempt) return { studentId, status: "not_started", score: null };
    if (!attempt.submittedAt) return { studentId, status: "in_progress", score: null };
    return { studentId, status: attempt.autoSubmitted ? "auto_submitted" : "submitted", score: attempt.score };
  });
}

export function getBatchRank(examId: string, studentId: string): number | null {
  const attempts = listAttemptsForExam(examId)
    .filter((a) => a.submittedAt && a.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const index = attempts.findIndex((a) => a.studentId === studentId);
  return index === -1 ? null : index + 1;
}

export type AttemptReviewQuestion = {
  id: string;
  text: string;
  options: QuestionOption;
  correctOptionIndex: 0 | 1 | 2 | 3;
  selectedOptionIndex: 0 | 1 | 2 | 3 | null;
  marks: number;
  negativeMarks: number;
  earnedMarks: number;
  isCorrect: boolean;
};

// Only meaningful once the exam is published — callers must check
// `exam.publishedAt` before showing this to a student (correct answers are
// otherwise still hidden pre-publish, same as the exam detail views).
export function getAttemptReview(
  examId: string,
  studentId: string,
): { attempt: ExamAttempt; questions: AttemptReviewQuestion[] } | null {
  const attempt = getAttempt(examId, studentId);
  if (!attempt || !attempt.submittedAt) return null;

  const questions = listQuestionsFull(examId).map((question) => {
    const answer = attempt.answers.find((a) => a.questionId === question.id);
    const selectedOptionIndex = answer?.selectedOptionIndex ?? null;
    const isCorrect = selectedOptionIndex === question.correctOptionIndex;
    const earnedMarks =
      selectedOptionIndex === null ? 0 : isCorrect ? question.marks : -question.negativeMarks;
    return {
      id: question.id,
      text: question.text,
      options: question.options,
      correctOptionIndex: question.correctOptionIndex,
      selectedOptionIndex,
      marks: question.marks,
      negativeMarks: question.negativeMarks,
      earnedMarks,
      isCorrect,
    };
  });

  return { attempt, questions };
}

export function publishResults(examId: string): void {
  const exam = db.exams.find((e) => e.id === examId);
  if (!exam) return;
  exam.publishedAt = new Date().toISOString();
}

export function deleteExamResults(examId: string): void {
  db.examAttempts = db.examAttempts.filter((a) => a.examId !== examId);
}
