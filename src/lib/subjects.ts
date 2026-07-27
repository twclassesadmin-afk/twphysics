export const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology", "Reasoning"] as const;

export type Subject = (typeof SUBJECTS)[number];
