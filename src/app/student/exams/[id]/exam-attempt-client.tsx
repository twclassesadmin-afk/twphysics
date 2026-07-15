"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ExamAnswer, Question } from "@/lib/store/types";
import { msUntilEnd } from "@/lib/time-gate";
import { submitExamAttempt } from "../actions";

type AttemptQuestion = Omit<Question, "correctOptionIndex">;

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ExamAttemptClient({
  examId,
  title,
  scheduledAt,
  durationMinutes,
  questions,
  initialAnswers,
}: {
  examId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  questions: AttemptQuestion[];
  initialAnswers: ExamAnswer[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Map<string, 0 | 1 | 2 | 3>>(
    () =>
      new Map(
        initialAnswers
          .filter((a): a is ExamAnswer & { selectedOptionIndex: 0 | 1 | 2 | 3 } => a.selectedOptionIndex !== null)
          .map((a) => [a.questionId, a.selectedOptionIndex]),
      ),
  );
  const [remainingMs, setRemainingMs] = useState(() => msUntilEnd(scheduledAt, durationMinutes));
  const submittedRef = useRef(false);

  const submit = useCallback(
    (autoSubmitted: boolean) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      const payload: ExamAnswer[] = questions.map((q) => ({
        questionId: q.id,
        selectedOptionIndex: answers.get(q.id) ?? null,
      }));
      submitExamAttempt(examId, payload, autoSubmitted).then((result) => {
        if (result.ok) {
          toast.success(autoSubmitted ? "Time's up — submitted automatically" : "Exam submitted");
          router.push("/student/exams");
        } else {
          toast.error(result.error);
          submittedRef.current = false;
        }
      });
    },
    [answers, examId, questions, router],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = msUntilEnd(scheduledAt, durationMinutes);
      setRemainingMs(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        submit(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [scheduledAt, durationMinutes, submit]);

  function selectOption(questionId: string, optionIndex: 0 | 1 | 2 | 3) {
    setAnswers((prev) => new Map(prev).set(questionId, optionIndex));
  }

  const answeredCount = answers.size;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:space-y-0">
          <CardTitle>{title}</CardTitle>
          <Badge variant={remainingMs < 60_000 ? "destructive" : "secondary"}>
            {formatCountdown(remainingMs)} remaining
          </Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {answeredCount}/{questions.length} answered
        </CardContent>
      </Card>

      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardContent className="space-y-3 pt-4">
            <p className="text-sm font-medium">
              {index + 1}. {question.text}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => {
                const selected = answers.get(question.id) === optionIndex;
                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() => selectOption(question.id, optionIndex as 0 | 1 | 2 | 3)}
                    className={`rounded-lg border p-2 text-left text-sm transition-colors ${
                      selected ? "border-primary bg-primary/5 font-medium" : "hover:bg-accent"
                    }`}
                  >
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={() => submit(false)}>Submit Exam</Button>
      </div>
    </div>
  );
}
