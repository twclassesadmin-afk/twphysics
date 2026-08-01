"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { Issue, Student } from "@/lib/store/types";
import { tagStudent } from "./actions";

const TAG_LABEL: Record<string, string> = {
  topper: "Topper",
  weak: "Weak",
  focus_needed: "Focus needed",
};

const CATEGORY_LABEL: Record<string, string> = {
  college_going: "College-going",
  long_term: "Long-term",
};

type Tag = "topper" | "weak" | "focus_needed" | "none";

export function TutorStudentsClient({ students, issues }: { students: Student[]; issues: Issue[] }) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [tagDialogId, setTagDialogId] = useState<string | null>(null);
  const [draftTag, setDraftTag] = useState<Tag>("none");
  const [draftNote, setDraftNote] = useState("");
  const [pending, startTransition] = useTransition();

  const detailStudent = students.find((s) => s.id === detailId);
  const detailIssues = detailStudent ? issues.filter((i) => i.raisedById === detailStudent.id) : [];
  const tagStudentRow = students.find((s) => s.id === tagDialogId);

  function openTagDialog(studentId: string) {
    const student = students.find((s) => s.id === studentId);
    setDraftTag((student?.tag as Tag) ?? "none");
    setDraftNote("");
    setTagDialogId(studentId);
  }

  function saveTag() {
    if (!tagDialogId) return;
    startTransition(async () => {
      const result = await tagStudent(tagDialogId, draftTag, draftNote);
      if (result.ok) {
        toast.success("Tag updated");
        setTagDialogId(null);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Batch Roster</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No students assigned yet.</p>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="space-y-2 sm:hidden">
                {students.map((student) => (
                  <div key={student.id} className="rounded-lg border p-3 text-sm">
                    <button className="font-medium underline-offset-4 hover:underline" onClick={() => setDetailId(student.id)}>
                      {student.name}
                    </button>
                    <p className="mt-0.5 text-xs text-muted-foreground">{student.batchName}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{student.attendancePct}% attendance</span>
                      {student.tag && <Badge variant="outline">{TAG_LABEL[student.tag]}</Badge>}
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => openTagDialog(student.id)}>
                      Edit Tag
                    </Button>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Tag</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <button
                            className="font-medium underline-offset-4 hover:underline"
                            onClick={() => setDetailId(student.id)}
                          >
                            {student.name}
                          </button>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{student.batchName}</TableCell>
                        <TableCell>{student.attendancePct}%</TableCell>
                        <TableCell>
                          {student.tag ? <Badge variant="outline">{TAG_LABEL[student.tag]}</Badge> : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openTagDialog(student.id)}>
                            Edit Tag
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Drill-down profile */}
      <Dialog open={detailId !== null} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {detailStudent && (
            <>
              <DialogHeader>
                <DialogTitle>{detailStudent.name}</DialogTitle>
                <DialogDescription>
                  {detailStudent.courseName || "No course"} · {detailStudent.batchName}
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="profile">
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p>{detailStudent.email || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p>{detailStudent.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Student type</p>
                      <p>{detailStudent.studentCategory ? CATEGORY_LABEL[detailStudent.studentCategory] : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Father&apos;s name</p>
                      <p>{detailStudent.parentName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Father&apos;s phone</p>
                      <p>{detailStudent.parentPhone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Preparing for</p>
                      <p>
                        {detailStudent.stream ?? "—"}
                        {detailStudent.targetExams.length > 0 ? ` (${detailStudent.targetExams.join(", ")})` : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Learning mode / type</p>
                      <p>
                        {detailStudent.learningMode ?? "—"}
                        {detailStudent.learningType ? ` · ${detailStudent.learningType}` : ""}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Attendance</p>
                      <p className="font-semibold">{detailStudent.attendancePct}%</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Tag</p>
                      <p className="font-semibold">
                        {detailStudent.tag ? TAG_LABEL[detailStudent.tag] : "None"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Attendance log</p>
                    {detailStudent.attendanceLog.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>
                    ) : (
                      <div className="max-h-48 space-y-1 overflow-y-auto">
                        {detailStudent.attendanceLog.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                            <span>
                              {entry.date} · {entry.subject}
                            </span>
                            <Badge variant={entry.attended ? "secondary" : "destructive"}>
                              {entry.attended ? "Present" : "Absent"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                  <p className="mb-2 text-sm font-medium">Issues raised</p>
                  {detailIssues.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No issues raised.</p>
                  ) : (
                    <div className="space-y-2">
                      {detailIssues.map((issue) => (
                        <div key={issue.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                          <span>{issue.subject}</span>
                          <Badge variant={issue.status === "resolved" ? "secondary" : "outline"}>
                            {issue.status.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Tag editor */}
      <Dialog open={tagDialogId !== null} onOpenChange={(open) => !open && setTagDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tag {tagStudentRow?.name}</DialogTitle>
            <DialogDescription>Visible to admin and other tutors on this batch.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tag</Label>
              <Select
                items={[
                  { value: "none", label: "No tag" },
                  { value: "topper", label: "Topper" },
                  { value: "weak", label: "Weak" },
                  { value: "focus_needed", label: "Focus needed" },
                ]}
                value={draftTag}
                onValueChange={(value) => setDraftTag(value as Tag)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No tag</SelectItem>
                  <SelectItem value="topper">Topper</SelectItem>
                  <SelectItem value="weak">Weak</SelectItem>
                  <SelectItem value="focus_needed">Focus needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-note">Note (optional)</Label>
              <Textarea
                id="tag-note"
                rows={3}
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={saveTag} disabled={pending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
