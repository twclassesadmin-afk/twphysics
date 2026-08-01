import { createClient } from "@/lib/supabase/server";
import { hasEnded } from "../time-gate";
import { isInvalidIdError } from "./db-errors";
import type { Tutor, TutorApplication } from "./types";

export async function listTutorApplications(): Promise<TutorApplication[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tutor_applications").select("*").order("submitted_at", { ascending: false });
  if (error) throw error;
  return data.map(mapApplication);
}

function mapApplication(row: {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  subjects: string[];
  qualifications: string;
  experience: string;
  availability: string;
  bio: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}): TutorApplication {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    subjects: row.subjects,
    qualifications: row.qualifications,
    experience: row.experience,
    availability: row.availability,
    bio: row.bio,
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
  };
}

export async function addTutorApplication(input: {
  fullName: string;
  email: string;
  phone: string;
  subjects: string[];
  qualifications: string;
  experience: string;
  availability: string;
  bio: string;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("tutor_applications").insert({
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    subjects: input.subjects,
    qualifications: input.qualifications,
    experience: input.experience,
    availability: input.availability,
    bio: input.bio,
  });
  if (error) throw error;
}

export async function getTutorApplication(id: string): Promise<TutorApplication | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tutor_applications").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (isInvalidIdError(error)) return undefined;
    throw error;
  }
  return data ? mapApplication(data) : undefined;
}

export async function reviewTutorApplication(
  id: string,
  status: "approved" | "rejected",
  reviewerId: string | null,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tutor_applications")
    .update({ status, reviewed_by: reviewerId, reviewed_at: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  if (error) throw error;
}

async function mapTutor(
  row: {
    id: string;
    application_id: string | null;
    phone: string;
    subjects: string[];
    qualifications: string;
    availability: string;
    bio: string;
    joined_at: string;
  },
  profile: { full_name: string | null; email: string | null } | undefined,
): Promise<Tutor> {
  return {
    id: row.id,
    applicationId: row.application_id,
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? "",
    phone: row.phone,
    subjects: row.subjects,
    qualifications: row.qualifications,
    availability: row.availability,
    bio: row.bio,
    joinedAt: row.joined_at,
  };
}

async function profilesById(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ids: string[],
): Promise<Map<string, { full_name: string | null; email: string | null }>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
  if (error) throw error;
  return new Map(data.map((p) => [p.id, p]));
}

export async function listTutors(): Promise<Tutor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tutors").select("*");
  if (error) throw error;
  const profiles = await profilesById(supabase, data.map((t) => t.id));
  return Promise.all(data.map((row) => mapTutor(row, profiles.get(row.id))));
}

export async function getTutor(id: string): Promise<Tutor | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tutors").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (isInvalidIdError(error)) return undefined;
    throw error;
  }
  if (!data) return undefined;
  const profiles = await profilesById(supabase, [id]);
  return mapTutor(data, profiles.get(id));
}

// tutorId is the real Supabase Auth user id created for this tutor by the
// caller (see src/lib/supabase/admin.ts's createAuthUser) — a tutor's row
// extends that real account, it doesn't mint its own id.
export async function createTutorFromApplication(tutorId: string, application: TutorApplication): Promise<Tutor> {
  const supabase = await createClient();
  const { error } = await supabase.from("tutors").insert({
    id: tutorId,
    application_id: application.id,
    phone: application.phone,
    subjects: application.subjects,
    qualifications: application.qualifications,
    availability: application.availability,
    bio: application.bio,
    joined_at: new Date().toISOString().slice(0, 10),
  });
  if (error) throw error;
  const tutor = await getTutor(tutorId);
  if (!tutor) throw new Error("Failed to load tutor after insert");
  return tutor;
}

export async function updateTutorProfile(
  tutorId: string,
  patch: { phone?: string; availability?: string; bio?: string },
): Promise<void> {
  const supabase = await createClient();
  const update: Record<string, string> = {};
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.availability !== undefined) update.availability = patch.availability;
  if (patch.bio !== undefined) update.bio = patch.bio;
  if (Object.keys(update).length === 0) return;
  const { error } = await supabase.from("tutors").update(update).eq("id", tutorId);
  if (error) throw error;
}

export async function countClassesCompletedForTutor(tutorId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("scheduled_at, duration_minutes")
    .eq("tutor_id", tutorId);
  if (error) throw error;
  return data.filter((c) => hasEnded(c.scheduled_at, c.duration_minutes)).length;
}
