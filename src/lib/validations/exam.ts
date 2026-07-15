import { z } from "zod";

export const questionSchema = z.object({
  text: z.string().trim().min(1, "Question text is required"),
  options: z.tuple([
    z.string().trim().min(1, "Option A is required"),
    z.string().trim().min(1, "Option B is required"),
    z.string().trim().min(1, "Option C is required"),
    z.string().trim().min(1, "Option D is required"),
  ]),
  correctOptionIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  marks: z.number().positive("Marks must be greater than 0"),
  negativeMarks: z.number().min(0, "Negative marks can't be negative"),
});

export const createExamSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  subject: z.string().trim().min(1, "Subject is required"),
  batchId: z.string().trim().min(1, "Select a batch"),
  scheduledAt: z.string().trim().min(1, "Scheduled date/time is required"),
  durationMinutes: z.number().positive("Duration must be greater than 0"),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
