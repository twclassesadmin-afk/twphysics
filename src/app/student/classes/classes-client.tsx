"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Video, FileText, NotebookPen, Trash2 } from "lucide-react";
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
import type { ScheduledClass } from "@/lib/store/types";
import { markAttendance } from "./actions";

type ClassWithGate = ScheduledClass & { started: boolean; ended: boolean };

export function StudentClassesClient({ classes }: { classes: ClassWithGate[] }) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openClassId, setOpenClassId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function openNotes(classId: string) {
    setDraft(notes[classId] ?? "");
    setOpenClassId(classId);
  }

  function saveNote() {
    if (!openClassId) return;
    setNotes((prev) => ({ ...prev, [openClassId]: draft }));
    toast.success("Note saved");
    setOpenClassId(null);
  }

  function deleteNote() {
    if (!openClassId) return;
    setNotes((prev) => {
      const next = { ...prev };
      delete next[openClassId];
      return next;
    });
    toast.success("Note deleted");
    setOpenClassId(null);
  }

  function handleJoin(cls: ClassWithGate) {
    void markAttendance(cls.id);
    window.open(cls.joinUrl, "_blank", "noopener,noreferrer");
  }

  const activeClass = classes.find((c) => c.id === openClassId);

  return (
    <Dialog open={openClassId !== null} onOpenChange={(open) => !open && setOpenClassId(null)}>
      <Card>
        <CardHeader>
          <CardTitle>Class Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {classes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No classes scheduled yet.</p>
          ) : (
            classes.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">
                    {cls.subject} — {cls.topic}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(cls.scheduledAt).toLocaleString("en-IN")} · {cls.tutorName}
                  </p>
                  {notes[cls.id] && (
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground italic">
                      Note: {notes[cls.id]}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={!cls.started ? "outline" : cls.ended ? "secondary" : "default"}>
                    {!cls.started ? "Upcoming" : cls.ended ? "Ended" : "Live"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => openNotes(cls.id)}>
                    <NotebookPen /> {notes[cls.id] ? "Edit Note" : "Add Note"}
                  </Button>
                  {!cls.started ? (
                    <Button size="sm" disabled title={`Starts at ${new Date(cls.scheduledAt).toLocaleString("en-IN")}`}>
                      <Video /> Starts {new Date(cls.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </Button>
                  ) : cls.ended ? (
                    cls.recordingUrl ? (
                      <Button size="sm" variant="outline" render={<a href={cls.recordingUrl} target="_blank" rel="noopener noreferrer" />}>
                        <FileText /> Watch Recording
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        <FileText /> Recording pending
                      </Button>
                    )
                  ) : (
                    <Button size="sm" onClick={() => handleJoin(cls)}>
                      <Video /> Join
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {activeClass ? `${activeClass.subject} — ${activeClass.topic}` : "Class note"}
          </DialogTitle>
          <DialogDescription>
            Private to you — visible only in your dashboard.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          rows={6}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write your notes for this class..."
        />
        <DialogFooter className="sm:justify-between">
          {openClassId && notes[openClassId] ? (
            <Button variant="ghost" className="text-destructive" onClick={deleteNote}>
              <Trash2 /> Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={saveNote}>Save Note</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
