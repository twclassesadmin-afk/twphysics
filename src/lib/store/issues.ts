import { db, nextId } from "./db";
import type { Issue } from "./types";

export function listIssues(): Issue[] {
  return db.issues;
}

export function listIssuesForUser(userId: string): Issue[] {
  return db.issues.filter((i) => i.raisedById === userId);
}

export function getIssue(id: string): Issue | undefined {
  return db.issues.find((i) => i.id === id);
}

export function addIssue(input: {
  subject: string;
  description: string;
  raisedById: string;
  raisedByName: string;
  raisedByRole: Issue["raisedByRole"];
}): Issue {
  const issue: Issue = {
    id: nextId("iss"),
    ...input,
    status: "open",
    assignedTo: null,
    createdAt: new Date().toISOString().slice(0, 10),
    comments: [],
  };
  db.issues.push(issue);
  return issue;
}

export function updateIssueStatus(id: string, status: Issue["status"], assignedTo?: string): void {
  const issue = db.issues.find((i) => i.id === id);
  if (!issue) return;
  issue.status = status;
  if (assignedTo !== undefined) issue.assignedTo = assignedTo;
}

export function addIssueComment(id: string, author: string, message: string): void {
  const issue = db.issues.find((i) => i.id === id);
  if (!issue) return;
  issue.comments.push({
    author,
    message,
    at: new Date().toISOString().replace("T", " ").slice(0, 16),
  });
}
