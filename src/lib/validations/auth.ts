import { z } from "zod";

// Indian mobile: optional +91 / 0 prefix, then 10 digits starting 6–9.
// Spaces and dashes are tolerated so "98765 43210" is accepted.
const indianMobile = (message: string) =>
  z
    .string()
    .trim()
    .refine((v) => /^(?:\+?91|0)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")), message);

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the student's full name").max(120),
  phone: indianMobile("Enter a valid 10-digit mobile number"),
  parentName: z.string().trim().min(2, "Enter father's name"),
  parentPhone: indianMobile("Enter a valid 10-digit mobile number for the parent"),
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
