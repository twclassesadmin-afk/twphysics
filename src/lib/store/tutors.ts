import { db, nextId } from "./db";
import { hasEnded } from "../time-gate";
import type { Tutor, TutorApplication } from "./types";

export function listTutorApplications(): TutorApplication[] {
  return db.tutorApplications;
}

export function getTutorApplication(id: string): TutorApplication | undefined {
  return db.tutorApplications.find((a) => a.id === id);
}

export function reviewTutorApplication(
  id: string,
  status: "approved" | "rejected",
  reviewerName: string,
): void {
  const application = db.tutorApplications.find((a) => a.id === id);
  if (!application) return;
  application.status = status;
  application.reviewedBy = reviewerName;
  application.reviewedAt = new Date().toISOString().slice(0, 10);
}

export function listTutors(): Tutor[] {
  return db.tutors;
}

export function getTutor(id: string): Tutor | undefined {
  return db.tutors.find((t) => t.id === id);
}

export function createTutorFromApplication(application: TutorApplication): Tutor {
  const tutor: Tutor = {
    id: nextId("tut"),
    applicationId: application.id,
    fullName: application.fullName,
    email: application.email,
    phone: application.phone,
    subjects: application.subjects,
    qualifications: application.qualifications,
    availability: application.availability,
    bio: application.bio,
    joinedAt: new Date().toISOString().slice(0, 10),
  };
  db.tutors.push(tutor);
  return tutor;
}

export function updateTutorProfile(
  tutorId: string,
  patch: { phone?: string; availability?: string; bio?: string },
): void {
  const tutor = db.tutors.find((t) => t.id === tutorId);
  if (!tutor) return;
  if (patch.phone !== undefined) tutor.phone = patch.phone;
  if (patch.availability !== undefined) tutor.availability = patch.availability;
  if (patch.bio !== undefined) tutor.bio = patch.bio;
}

export function countClassesCompletedForTutor(tutorId: string): number {
  return db.classes.filter((c) => c.tutorId === tutorId && hasEnded(c.scheduledAt, c.durationMinutes)).length;
}
