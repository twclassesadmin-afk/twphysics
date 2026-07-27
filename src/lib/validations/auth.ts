import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the student's full name").max(120),
  phone: z.string().trim().min(10, "Enter a valid student phone number"),
  parentName: z.string().trim().min(2, "Enter father's name"),
  parentPhone: z.string().trim().min(10, "Enter a valid father's phone number"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  studentCategory: z.enum(["college_going", "long_term"]),
  courseId: z.string().trim().min(1, "Select a course"),
  stream: z.enum(["MPC", "BiPC"]),
  targetExams: z.array(z.string()).min(1, "Select at least one exam you're preparing for"),
  learningMode: z.enum(["online", "offline"]),
  learningType: z.enum(["individual", "group"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
