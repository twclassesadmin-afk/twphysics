"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Batch } from "@/lib/store/types";
import { createExam } from "../actions";

type DraftQuestion = {
  text: string;
  options: [string, string, string, string];
  correctOptionIndex: 0 | 1 | 2 | 3;
};

function blankQuestion(): DraftQuestion {
  return { text: "", options: ["", "", "", ""], correctOptionIndex: 0 };
}

export function ExamBuilder({ batches }: { batches: Batch[] }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [batchId, setBatchId] = useState(batches[0]?.id ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [marksPerQuestion, setMarksPerQuestion] = useState("4");
  const [negativeMarks, setNegativeMarks] = useState("0");
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion()]);
  const [pending, startTransition] = useTransition();

  function updateQuestion(index: number, patch: Partial<DraftQuestion>) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function updateOption(index: number, optionIndex: 0 | 1 | 2 | 3, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q;
        const options = [...q.options] as [string, string, string, string];
        options[optionIndex] = value;
        return { ...q, options };
      }),
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, blankQuestion()]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  const isValid =
    title.trim() &&
    subject.trim() &&
    batchId &&
    scheduledAt &&
    Number(durationMinutes) > 0 &&
    Number(marksPerQuestion) > 0 &&
    questions.length > 0 &&
    questions.every((q) => q.text.trim() && q.options.every((o) => o.trim()));

  function submit() {
    if (!isValid) return;
    startTransition(async () => {
      const result = await createExam({
        title,
        subject,
        batchId,
        scheduledAt,
        durationMinutes: Number(durationMinutes),
        questions: questions.map((q) => ({
          text: q.text,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          marks: Number(marksPerQuestion),
          negativeMarks: Number(negativeMarks) || 0,
        })),
      });
      if (result && !result.ok) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exam details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="exam-title">Title</Label>
            <Input id="exam-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-subject">Subject</Label>
            <Input id="exam-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Batch</Label>
            <Select value={batchId} onValueChange={(value) => setBatchId(value ?? "")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} ({b.course})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-duration">Duration (minutes)</Label>
            <Input
              id="exam-duration"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-marks">Marks per question</Label>
            <Input
              id="exam-marks"
              type="number"
              value={marksPerQuestion}
              onChange={(e) => setMarksPerQuestion(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-negative">Negative marks per wrong answer (optional)</Label>
            <Input
              id="exam-negative"
              type="number"
              value={negativeMarks}
              onChange={(e) => setNegativeMarks(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="exam-scheduled">Starts at (auto-starts, no manual open needed)</Label>
            <Input
              id="exam-scheduled"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {questions.map((question, index) => (
        <Card key={index}>
          <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:space-y-0">
            <CardTitle className="text-base">
              Question {index + 1}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({marksPerQuestion} marks{Number(negativeMarks) > 0 ? `, -${negativeMarks}` : ""})
              </span>
            </CardTitle>
            {questions.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeQuestion(index)} aria-label="Remove question">
                <Trash2 className="size-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Question text</Label>
              <Input value={question.text} onChange={(e) => updateQuestion(index, { text: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant={question.correctOptionIndex === optionIndex ? "default" : "outline"}
                    className="shrink-0 rounded-full"
                    onClick={() => updateQuestion(index, { correctOptionIndex: optionIndex as 0 | 1 | 2 | 3 })}
                    aria-label={`Mark option ${optionIndex + 1} correct`}
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </Button>
                  <Input
                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                    value={option}
                    onChange={(e) => updateOption(index, optionIndex as 0 | 1 | 2 | 3, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Correct answer: <Badge variant="secondary">{String.fromCharCode(65 + question.correctOptionIndex)}</Badge>
            </p>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={addQuestion}>
          <Plus /> Add Question
        </Button>
        <Button onClick={submit} disabled={!isValid || pending}>
          Create Exam
        </Button>
      </div>
    </div>
  );
}
