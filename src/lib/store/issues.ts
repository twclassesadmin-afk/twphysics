import { createClient } from "@/lib/supabase/server";
import { isInvalidIdError } from "./db-errors";
import type { Issue } from "./types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function profileNameLookup(supabase: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  const filtered = [...new Set(ids.filter(Boolean))];
  if (filtered.length === 0) return new Map();
  const { data, error } = await supabase.from("profiles").select("id, full_name").in("id", filtered);
  if (error) throw error;
  return new Map(data.map((p) => [p.id, p.full_name ?? ""]));
}

async function commentsByIssue(
  supabase: SupabaseClient,
  issueIds: string[],
): Promise<Map<string, { author: string; message: string; at: string }[]>> {
  if (issueIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("issue_comments")
    .select("*")
    .in("issue_id", issueIds)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const authorNames = await profileNameLookup(supabase, data.map((c) => c.author_id));
  const map = new Map<string, { author: string; message: string; at: string }[]>();
  for (const row of data) {
    const list = map.get(row.issue_id) ?? [];
    list.push({ author: authorNames.get(row.author_id) ?? "", message: row.message, at: row.created_at });
    map.set(row.issue_id, list);
  }
  return map;
}

async function mapIssues(
  supabase: SupabaseClient,
  rows: {
    id: string;
    subject: string;
    description: string;
    raised_by_id: string;
    raised_by_role: "student" | "tutor";
    status: Issue["status"];
    assigned_to: string | null;
    created_at: string;
  }[],
): Promise<Issue[]> {
  const [names, comments] = await Promise.all([
    profileNameLookup(supabase, rows.map((r) => r.raised_by_id)),
    commentsByIssue(supabase, rows.map((r) => r.id)),
  ]);
  return rows.map((row) => ({
    id: row.id,
    subject: row.subject,
    description: row.description,
    raisedById: row.raised_by_id,
    raisedByName: names.get(row.raised_by_id) ?? "",
    raisedByRole: row.raised_by_role,
    status: row.status,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
    comments: comments.get(row.id) ?? [],
  }));
}

export async function listIssues(): Promise<Issue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("issues").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return mapIssues(supabase, data);
}

export async function listIssuesForUser(userId: string): Promise<Issue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("issues").select("*").eq("raised_by_id", userId);
  if (error) throw error;
  return mapIssues(supabase, data);
}

export async function getIssue(id: string): Promise<Issue | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("issues").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (isInvalidIdError(error)) return undefined;
    throw error;
  }
  if (!data) return undefined;
  const [issue] = await mapIssues(supabase, [data]);
  return issue;
}

export async function addIssue(input: {
  subject: string;
  description: string;
  raisedById: string;
  raisedByName: string;
  raisedByRole: Issue["raisedByRole"];
}): Promise<Issue> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("issues")
    .insert({
      subject: input.subject,
      description: input.description,
      raised_by_id: input.raisedById,
      raised_by_role: input.raisedByRole,
    })
    .select()
    .single();
  if (error) throw error;
  const [issue] = await mapIssues(supabase, [data]);
  return issue;
}

export async function updateIssueStatus(id: string, status: Issue["status"], assignedTo?: string): Promise<void> {
  const supabase = await createClient();
  const update: Record<string, string> = { status };
  if (assignedTo !== undefined) update.assigned_to = assignedTo;
  const { error } = await supabase.from("issues").update(update).eq("id", id);
  if (error) throw error;
}

export async function addIssueComment(id: string, authorId: string, message: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("issue_comments").insert({ issue_id: id, author_id: authorId, message });
  if (error) throw error;
}
