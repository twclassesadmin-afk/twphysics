"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { Issue } from "@/lib/store/types";
import { assignIssueToMe, resolveIssue, commentOnIssue } from "./actions";

const STATUS_VARIANT: Record<string, "outline" | "secondary" | "destructive"> = {
  open: "destructive",
  in_progress: "outline",
  resolved: "secondary",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

export function AdminIssuesClient({ issues }: { issues: Issue[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();

  const activeIssue = issues.find((i) => i.id === openId);

  function assign(id: string) {
    startTransition(async () => {
      const result = await assignIssueToMe(id);
      if (result.ok) toast.success("Assigned to you");
      else toast.error(result.error);
    });
  }

  function resolve(id: string) {
    startTransition(async () => {
      const result = await resolveIssue(id);
      if (result.ok) toast.success("Issue resolved — raiser notified");
      else toast.error(result.error);
    });
  }

  function addComment() {
    if (!openId || !comment.trim()) return;
    startTransition(async () => {
      const result = await commentOnIssue(openId, comment);
      if (result.ok) {
        toast.success("Comment added — raiser notified");
        setComment("");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Issue Inbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {issues.length === 0 ? (
            <p className="text-sm text-muted-foreground">No issues raised yet.</p>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between rounded-lg border p-3">
                <button className="text-left" onClick={() => setOpenId(issue.id)}>
                  <p className="text-sm font-medium underline-offset-4 hover:underline">{issue.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {issue.raisedByName} ({issue.raisedByRole}) · {issue.createdAt}
                  </p>
                </button>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[issue.status]}>{STATUS_LABEL[issue.status]}</Badge>
                  {issue.assignedTo ? (
                    <span className="text-sm text-muted-foreground">{issue.assignedTo}</span>
                  ) : (
                    <Button
                      variant="link"
                      className="h-auto px-0"
                      disabled={pending}
                      onClick={() => assign(issue.id)}
                    >
                      Assign to me
                    </Button>
                  )}
                  {issue.status !== "resolved" && (
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => resolve(issue.id)}>
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={openId !== null} onOpenChange={(open) => !open && setOpenId(null)}>
        <DialogContent>
          {activeIssue && (
            <>
              <DialogHeader>
                <DialogTitle>{activeIssue.subject}</DialogTitle>
                <DialogDescription>
                  Raised by {activeIssue.raisedByName} ({activeIssue.raisedByRole}) · {activeIssue.createdAt}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{activeIssue.description}</p>
              <div className="space-y-2">
                {activeIssue.comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                  activeIssue.comments.map((c, i) => (
                    <div key={i} className="rounded-lg bg-muted p-2 text-sm">
                      <p>{c.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {c.author} · {c.at}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  rows={2}
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
                <Button onClick={addComment} disabled={pending || !comment.trim()}>
                  Add Comment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
