"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarPlus, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { Batch, ScheduledClass, SyllabusItem } from "@/lib/store/types";
import { scheduleClass, rescheduleClass } from "./actions";

type BatchWithClasses = Batch & {
  studentCount: number;
  upcomingClasses: ScheduledClass[];
  mySubjects: string[];
  syllabusTopics: SyllabusItem[];
};

function toDatetimeLocal(value: string): string {
  // datetime-local inputs need "YYYY-MM-DDTHH:mm", ISO strings may carry seconds/offset
  return value.length >= 16 ? value.slice(0, 16) : value;
}

export function TutorBatchesClient({ batches }: { batches: BatchWithClasses[] }) {
  const [scheduleBatchId, setScheduleBatchId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ subject: "", topic: "", scheduledAt: "", durationMinutes: "60", joinUrl: "" });

  const [rescheduleClassId, setRescheduleClassId] = useState<string | null>(null);
  const [rescheduleDraft, setRescheduleDraft] = useState({ scheduledAt: "", durationMinutes: "60", joinUrl: "" });

  const [pending, startTransition] = useTransition();

  const scheduleBatch = batches.find((b) => b.id === scheduleBatchId);
  const topicOptions = scheduleBatch
    ? Array.from(
        new Set(scheduleBatch.syllabusTopics.filter((t) => t.subject === draft.subject).map((t) => t.topic)),
      )
    : [];

  function openSchedule(batch: BatchWithClasses) {
    const subject = batch.mySubjects[0] ?? "";
    setDraft({ subject, topic: "", scheduledAt: "", durationMinutes: "60", joinUrl: "" });
    setScheduleBatchId(batch.id);
  }

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

  function openReschedule(cls: ScheduledClass) {
    setRescheduleDraft({
      scheduledAt: toDatetimeLocal(cls.scheduledAt),
      durationMinutes: String(cls.durationMinutes),
      joinUrl: cls.joinUrl,
    });
    setRescheduleClassId(cls.id);
  }

  function submitReschedule() {
    if (!rescheduleClassId) return;
    startTransition(async () => {
      const result = await rescheduleClass({
        classId: rescheduleClassId,
        scheduledAt: rescheduleDraft.scheduledAt,
        durationMinutes: Number(rescheduleDraft.durationMinutes) || 60,
        joinUrl: rescheduleDraft.joinUrl,
      });
      if (result.ok) {
        toast.success("Class rescheduled — admin and students notified");
        setRescheduleClassId(null);
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
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{batch.studentCount} students enrolled</p>
              <p>Daily timing: {batch.dailyTime}</p>
              {batch.upcomingClasses.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-medium text-foreground">Upcoming classes</p>
                  {batch.upcomingClasses.map((cls) => (
                    <div key={cls.id} className="flex items-center justify-between gap-2 rounded-lg border p-2">
                      <span className="text-xs">
                        {cls.subject} — {cls.topic} · {new Date(cls.scheduledAt).toLocaleString("en-IN")}
                      </span>
                      <Button variant="ghost" size="icon-sm" onClick={() => openReschedule(cls)} aria-label="Reschedule">
                        <Pencil className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" size="sm" render={<Link href="/tutor/students" />}>
                View Roster
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openSchedule(batch)}
                disabled={batch.mySubjects.length === 0}
              >
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
              {scheduleBatch && ` Batch's official daily timing: ${scheduleBatch.dailyTime}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={draft.subject}
                onValueChange={(value) => setDraft({ ...draft, subject: value ?? "", topic: "" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(scheduleBatch?.mySubjects ?? []).map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Topic</Label>
              <Select value={draft.topic} onValueChange={(value) => setDraft({ ...draft, topic: value ?? "" })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a syllabus topic" />
                </SelectTrigger>
                <SelectContent>
                  {topicOptions.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No syllabus topics for {draft.subject || "this subject"} yet
                    </SelectItem>
                  ) : (
                    topicOptions.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
                id="class-duration" placeholder="e.g. 90"
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
            <Button onClick={submit} disabled={pending || !draft.subject || !draft.topic}>
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rescheduleClassId !== null} onOpenChange={(open) => !open && setRescheduleClassId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule class</DialogTitle>
            <DialogDescription>Notifies admin and the batch&apos;s students of the new time.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="rounded-lg border bg-muted/50 p-2 text-xs text-muted-foreground">
              This only changes this one class. It does not change the batch&apos;s daily timing — future
              classes still need to be scheduled separately. To change the recurring daily time itself,
              ask admin to update it.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reschedule-time">New start time</Label>
              <Input
                id="reschedule-time"
                type="datetime-local"
                value={rescheduleDraft.scheduledAt}
                onChange={(e) => setRescheduleDraft({ ...rescheduleDraft, scheduledAt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule-duration">Duration (minutes)</Label>
              <Input
                id="reschedule-duration" placeholder="e.g. 90"
                type="number"
                value={rescheduleDraft.durationMinutes}
                onChange={(e) => setRescheduleDraft({ ...rescheduleDraft, durationMinutes: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule-url">Join link</Label>
              <Input
                id="reschedule-url" placeholder="https://meet.google.com/..."
                value={rescheduleDraft.joinUrl}
                onChange={(e) => setRescheduleDraft({ ...rescheduleDraft, joinUrl: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={submitReschedule} disabled={pending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
