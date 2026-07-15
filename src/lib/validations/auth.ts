import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().trim().min(10, "Enter a valid phone number"),
  age: z.number().min(10, "Enter a valid age").max(60, "Enter a valid age"),
  parentName: z.string().trim().min(2, "Enter your parent/guardian's name"),
  parentPhone: z.string().trim().min(10, "Enter a valid parent/guardian phone number"),
  address: z.string().trim().min(10, "Enter your full address"),
  courseId: z.string().trim().min(1, "Select a course"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
