 "use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Video, NotebookPen, Trash2 } from "lucide-react";
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
import { markAttendance, saveClassNote, deleteClassNote } from "./actions";

type ClassWithGate = ScheduledClass & { started: boolean; ended: boolean };

export function StudentClassesClient({
  classes,
  initialNotes,
}: {
  classes: ClassWithGate[];
  initialNotes: Record<string, string>;
}) {
  const [notes, setNotes] = useState<Record<string, string>>(initialNotes);
  const [pending, startTransition] = useTransition();
  const [openClassId, setOpenClassId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function openNotes(classId: string) {
    setDraft(notes[classId] ?? "");
    setOpenClassId(classId);
  }

  function saveNote() {
    const classId = openClassId;
    if (!classId) return;
    startTransition(async () => {
      const result = await saveClassNote(classId, draft);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setNotes((prev) => ({ ...prev, [classId]: draft.trim() }));
      toast.success("Note saved");
      setOpenClassId(null);
    });
  }

  function deleteNote() {
    const classId = openClassId;
    if (!classId) return;
    startTransition(async () => {
      const result = await deleteClassNote(classId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setNotes((prev) => {
        const next = { ...prev };
        delete next[classId];
        return next;
      });
      toast.success("Note deleted");
      setOpenClassId(null);
    });
  }

  async function handleJoin(cls: ClassWithGate) {
    // Open synchronously (inside the click) so popup blockers allow it, then
    // record attendance; surface a failure instead of swallowing it.
    window.open(cls.joinUrl, "_blank", "noopener,noreferrer");
    const result = await markAttendance(cls.id);
    if (!result.ok) toast.error(`Attendance not recorded: ${result.error}`);
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
                    <Button size="sm" variant="outline" disabled>
                      Class ended
                    </Button>
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
            <Button variant="ghost" className="text-destructive" onClick={deleteNote} disabled={pending}>
              <Trash2 /> Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={saveNote} disabled={pending || !draft.trim()}>
              {pending ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
