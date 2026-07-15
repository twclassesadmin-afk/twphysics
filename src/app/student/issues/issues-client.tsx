"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Issue } from "@/lib/store/types";
import { raiseIssue } from "./actions";

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

export function StudentIssuesClient({ issues }: { issues: Issue[] }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  function submitIssue() {
    startTransition(async () => {
      const result = await raiseIssue(subject, description);
      if (result.ok) {
        toast.success("Issue submitted — your tutor and admin have been notified");
        setSubject("");
        setDescription("");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Tabs defaultValue="raise">
      <TabsList>
        <TabsTrigger value="raise">Raise an Issue</TabsTrigger>
        <TabsTrigger value="mine">Your Issues{issues.length > 0 ? ` (${issues.length})` : ""}</TabsTrigger>
      </TabsList>

      <TabsContent value="raise" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Raise an issue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issue-subject">Subject</Label>
              <Input
                id="issue-subject"
                placeholder="Brief summary of the issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-description">Description</Label>
              <Textarea
                id="issue-description"
                placeholder="Describe what's happening..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button onClick={submitIssue} disabled={pending || !subject.trim() || !description.trim()}>
              Submit Issue
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="mine" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Your issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {issues.length === 0 ? (
              <p className="text-sm text-muted-foreground">You haven&apos;t raised any issues yet.</p>
            ) : (
              issues.map((issue) => (
                <div key={issue.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{issue.subject}</p>
                      <p className="text-xs text-muted-foreground">Raised {issue.createdAt}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[issue.status]}>{STATUS_LABEL[issue.status]}</Badge>
                  </div>
                  {issue.comments.map((comment, i) => (
                    <div key={i} className="ml-3 rounded-lg bg-muted p-2 text-sm">
                      <p>{comment.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {comment.author} · {comment.at}
                      </p>
                    </div>
                  ))}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
