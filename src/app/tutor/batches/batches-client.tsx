"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { Batch } from "@/lib/store/types";
import { scheduleClass } from "./actions";

export function TutorBatchesClient({ batches }: { batches: (Batch & { studentCount: number })[] }) {
  const [scheduleBatchId, setScheduleBatchId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ subject: "", topic: "", scheduledAt: "", durationMinutes: "60", joinUrl: "" });
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!scheduleBatchId) return;
    startTransition(async () => {
      const result = await scheduleClass({
        batchId: scheduleBatchId,
        subject: draft.subject,
        topic: draft.topic,
        scheduledAt: draft.scheduledAt,
        durationMinutes: Number(draft.durationMinutes) || 60,
        joinUrl: draft.joinUrl,
      });
      if (result.ok) {
        toast.success("Class scheduled — batch notified");
        setScheduleBatchId(null);
        setDraft({ subject: "", topic: "", scheduledAt: "", durationMinutes: "60", joinUrl: "" });
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {batches.map((batch) => (
          <Card key={batch.id}>
            <CardHeader>
              <CardTitle className="text-base">{batch.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>{batch.studentCount} students enrolled</p>
              <p>Daily timing: {batch.dailyTime}</p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" size="sm" render={<Link href="/tutor/students" />}>
                View Roster
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setScheduleBatchId(batch.id)}>
                <CalendarPlus /> Schedule Class
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={scheduleBatchId !== null} onOpenChange={(open) => !open && setScheduleBatchId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a class</DialogTitle>
            <DialogDescription>
              Students will only see &ldquo;Join&rdquo; become active at the scheduled time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-subject">Subject</Label>
              <Input id="class-subject" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-topic">Topic</Label>
              <Input id="class-topic" value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-time">Starts at</Label>
              <Input
                id="class-time"
                type="datetime-local"
                value={draft.scheduledAt}
                onChange={(e) => setDraft({ ...draft, scheduledAt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-duration">Duration (minutes)</Label>
              <Input
                id="class-duration"
                type="number"
                value={draft.durationMinutes}
                onChange={(e) => setDraft({ ...draft, durationMinutes: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-url">Join link (Google Meet / Zoom)</Label>
              <Input
                id="class-url"
                placeholder="https://meet.google.com/..."
                value={draft.joinUrl}
                onChange={(e) => setDraft({ ...draft, joinUrl: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={submit} disabled={pending}>
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
