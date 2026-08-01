import { z } from "zod";

export const tutorApplicationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(10, "Enter a valid phone number"),
  subjects: z.array(z.string()).min(1, "Select at least one subject you can teach"),
  qualifications: z.string().trim().min(2, "Enter your qualifications"),
  experience: z.string().trim().min(1, "Enter your teaching experience"),
  availability: z.string().trim().min(1, "Enter your availability"),
  bio: z.string().trim().min(10, "Tell us a bit about yourself"),
});

export type TutorApplicationInput = z.infer<typeof tutorApplicationSchema>;
