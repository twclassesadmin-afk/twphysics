import { createClient } from "@/lib/supabase/server";

// Per-student private notes on scheduled classes (RLS: own rows only).
export async function listClassNotes(studentId: string): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("class_notes").select("class_id, note").eq("student_id", studentId);
  if (error) throw error;
  return Object.fromEntries(data.map((row) => [row.class_id, row.note]));
}

export async function upsertClassNote(studentId: string, classId: string, note: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("class_notes")
    .upsert({ student_id: studentId, class_id: classId, note, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function removeClassNote(studentId: string, classId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("class_notes").delete().eq("student_id", studentId).eq("class_id", classId);
  if (error) throw error;
}
