"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Batch, Broadcast, Issue } from "@/lib/store/types";
import { sendBroadcast, replyToIssue } from "./actions";

const STATUS_VARIANT: Record<string, "outline" | "secondary" | "destructive"> = {
  open: "destructive",
  in_progress: "outline",
  resolved: "secondary",
};

export function TutorCommunicationClient({
  batches,
  broadcasts,
  issues,
}: {
  batches: Batch[];
  broadcasts: Broadcast[];
  issues: Issue[];
}) {
  const [batchId, setBatchId] = useState(batches[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function submitBroadcast() {
    startTransition(async () => {
      const result = await sendBroadcast(batchId, message);
      if (result.ok) {
        toast.success("Broadcast sent — batch notified");
        setMessage("");
      } else {
        toast.error(result.error);
      }
    });
  }

  function submitReply(issueId: string) {
    const reply = replyDrafts[issueId]?.trim();
    if (!reply) return;
    startTransition(async () => {
      const result = await replyToIssue(issueId, reply);
      if (result.ok) {
        toast.success("Reply sent — student notified");
        setReplyDrafts((prev) => ({ ...prev, [issueId]: "" }));
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Broadcast an announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Batch</Label>
            <Select value={batchId} onValueChange={(value) => setBatchId(value ?? "")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="broadcast-message">Message</Label>
            <Textarea
              id="broadcast-message"
              placeholder="Write an announcement for your batch..."
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button onClick={submitBroadcast} disabled={pending || !message.trim() || !batchId}>
            Send Broadcast
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Broadcast History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {broadcasts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No broadcasts sent yet.</p>
          ) : (
            broadcasts.map((broadcast) => (
              <div key={broadcast.id} className="rounded-lg border p-3">
                <p className="text-sm">{broadcast.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {broadcast.batchName} · {broadcast.sentAt}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student issues in your batches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {issues.length === 0 ? (
            <p className="text-sm text-muted-foreground">No issues from your students.</p>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="space-y-3 rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{issue.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {issue.raisedByName} · {issue.createdAt}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[issue.status]}>
                    {issue.status === "resolved" ? "Resolved" : issue.status === "in_progress" ? "In progress" : "Open"}
                  </Badge>
                </div>

                {issue.comments.map((comment, i) => (
                  <div key={i} className="ml-4 rounded-lg bg-muted p-2 text-sm">
                    <p>{comment.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {comment.author} · {comment.at}
                    </p>
                  </div>
                ))}

                {issue.status !== "resolved" && (
                  <div className="flex gap-2">
                    <Textarea
                      rows={1}
                      placeholder="Write a reply..."
                      value={replyDrafts[issue.id] ?? ""}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [issue.id]: e.target.value }))
                      }
                      className="min-h-9 resize-none"
                    />
                    <Button size="sm" disabled={pending} onClick={() => submitReply(issue.id)}>
                      Reply
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}
