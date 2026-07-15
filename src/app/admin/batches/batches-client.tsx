"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Batch, Course, Student, Tutor } from "@/lib/store/types";
import { createCourse, createBatch, assignTutorToBatch } from "./actions";

type CourseWithSeats = Course & { seatsLeft: number };
type BatchWithFilled = Batch & { filled: number };

function blankHighlights() {
  return ["", "", "", ""];
}

export function AdminBatchesClient({
  courses,
  batches,
  tutors,
  students,
}: {
  courses: CourseWithSeats[];
  batches: BatchWithFilled[];
  tutors: Tutor[];
  students: Student[];
}) {
  const [pending, startTransition] = useTransition();

  const [courseOpen, setCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "",
    tagline: "",
    priceInInr: "",
    emiFromInr: "",
    durationMonths: "12",
  });
  const [highlights, setHighlights] = useState<string[]>(blankHighlights());

  const [batchOpen, setBatchOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({ name: "", courseId: courses[0]?.id ?? "", capacity: "60", dailyTime: "" });

  const [assignBatchId, setAssignBatchId] = useState<string | null>(null);
  const [assignTutorId, setAssignTutorId] = useState("");

  const [rosterBatchId, setRosterBatchId] = useState<string | null>(null);

  function addCourse() {
    if (!newCourse.name.trim()) return;
    startTransition(async () => {
      const result = await createCourse({
        name: newCourse.name,
        tagline: newCourse.tagline,
        priceInInr: Number(newCourse.priceInInr) || 0,
        emiFromInr: Number(newCourse.emiFromInr) || Math.round((Number(newCourse.priceInInr) || 0) / 12),
        durationMonths: Number(newCourse.durationMonths) || 12,
        highlights,
      });
      if (result.ok) {
        toast.success("Course created");
        setNewCourse({ name: "", tagline: "", priceInInr: "", emiFromInr: "", durationMonths: "12" });
        setHighlights(blankHighlights());
        setCourseOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  function addBatch() {
    if (!newBatch.name.trim()) return;
    const course = courses.find((c) => c.id === newBatch.courseId);
    startTransition(async () => {
      const result = await createBatch({
        name: newBatch.name,
        courseId: newBatch.courseId,
        course: course?.name ?? "",
        capacity: Number(newBatch.capacity) || 0,
        dailyTime: newBatch.dailyTime || "TBD",
      });
      if (result.ok) {
        toast.success("Batch created");
        setNewBatch({ name: "", courseId: courses[0]?.id ?? "", capacity: "60", dailyTime: "" });
        setBatchOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  function assignTutor() {
    if (!assignBatchId || !assignTutorId) return;
    const tutor = tutors.find((t) => t.id === assignTutorId);
    if (!tutor) return;
    startTransition(async () => {
      const result = await assignTutorToBatch(assignBatchId, tutor.id, tutor.fullName);
      if (result.ok) {
        toast.success(`Tutor assigned — batch notified that their tutor is now ${tutor.fullName}`);
        setAssignBatchId(null);
        setAssignTutorId("");
      } else {
        toast.error(result.error);
      }
    });
  }

  const rosterBatch = batches.find((b) => b.id === rosterBatchId);
  const rosterStudents = rosterBatch ? students.filter((s) => s.batchId === rosterBatch.id) : [];

  return (
    <>
      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-4">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Courses</h2>
          <Dialog open={courseOpen} onOpenChange={setCourseOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus /> New Course
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New course</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="course-name">Name</Label>
                  <Input
                    id="course-name"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-tagline">Tagline</Label>
                  <Input
                    id="course-tagline"
                    value={newCourse.tagline}
                    onChange={(e) => setNewCourse({ ...newCourse, tagline: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="course-price">Price (₹)</Label>
                    <Input
                      id="course-price"
                      type="number"
                      value={newCourse.priceInInr}
                      onChange={(e) => setNewCourse({ ...newCourse, priceInInr: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-emi">EMI/mo (₹)</Label>
                    <Input
                      id="course-emi"
                      type="number"
                      placeholder="auto"
                      value={newCourse.emiFromInr}
                      onChange={(e) => setNewCourse({ ...newCourse, emiFromInr: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-duration">Duration (mo)</Label>
                    <Input
                      id="course-duration"
                      type="number"
                      value={newCourse.durationMonths}
                      onChange={(e) => setNewCourse({ ...newCourse, durationMonths: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Highlights (shown as bullet points on the pricing card)</Label>
                  <div className="space-y-2">
                    {highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder={`Highlight ${index + 1}`}
                          value={highlight}
                          onChange={(e) =>
                            setHighlights((prev) => prev.map((h, i) => (i === index ? e.target.value : h)))
                          }
                        />
                        {highlights.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setHighlights((prev) => prev.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setHighlights((prev) => [...prev, ""])}>
                    <Plus /> Add highlight
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                <Button onClick={addCourse} disabled={!newCourse.name.trim() || pending}>
                  Create Course
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {course.name}
                  <Badge variant="secondary">₹{course.priceInInr.toLocaleString("en-IN")}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {course.tagline} · {course.durationMonths} months
                </p>
                <p>
                  ₹{course.emiFromInr.toLocaleString("en-IN")}/mo EMI · {course.seatsLeft} seats left
                </p>
                {course.highlights.length > 0 && (
                  <ul className="mt-2 list-inside list-disc space-y-0.5">
                    {course.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
        </TabsContent>

        <TabsContent value="batches" className="mt-4">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Batches</h2>
          <Dialog open={batchOpen} onOpenChange={setBatchOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus /> New Batch
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New batch</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-name">Name</Label>
                  <Input
                    id="batch-name"
                    value={newBatch.name}
                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select
                    value={newBatch.courseId}
                    onValueChange={(value) => setNewBatch({ ...newBatch, courseId: value ?? "" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch-capacity">Capacity</Label>
                  <Input
                    id="batch-capacity"
                    type="number"
                    value={newBatch.capacity}
                    onChange={(e) => setNewBatch({ ...newBatch, capacity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch-time">Daily timing</Label>
                  <Input
                    id="batch-time"
                    placeholder="7:00–8:30 AM"
                    value={newBatch.dailyTime}
                    onChange={(e) => setNewBatch({ ...newBatch, dailyTime: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                <Button onClick={addBatch} disabled={!newBatch.name.trim() || pending}>
                  Create Batch
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => {
            const fillPct = Math.round((batch.filled / batch.capacity) * 100);
            return (
              <Card key={batch.id}>
                <CardHeader>
                  <CardTitle className="text-base">{batch.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {batch.course} · {batch.dailyTime} · Starts{" "}
                    {new Date(batch.startDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Progress value={fillPct} />
                  <p className="text-sm text-muted-foreground">
                    {batch.filled}/{batch.capacity} seats filled (auto-calculated)
                  </p>
                  <p className="text-sm">
                    Tutor: <span className="font-medium">{batch.tutor}</span>
                  </p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAssignBatchId(batch.id);
                      setAssignTutorId(batch.tutorId ?? "");
                    }}
                  >
                    Assign Tutor
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setRosterBatchId(batch.id)}>
                    View Roster
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
        </TabsContent>
      </Tabs>

      <Dialog open={assignBatchId !== null} onOpenChange={(open) => !open && setAssignBatchId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign tutor</DialogTitle>
            <DialogDescription>
              Triggers an automatic batch-wide notification: &ldquo;Your tutor has been changed&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Tutor</Label>
            <Select value={assignTutorId} onValueChange={(value) => setAssignTutorId(value ?? "")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tutors.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.fullName} — {t.subjects}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={assignTutor} disabled={pending}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rosterBatchId !== null} onOpenChange={(open) => !open && setRosterBatchId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{rosterBatch?.name} roster</DialogTitle>
            <DialogDescription>{rosterStudents.length} students enrolled</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {rosterStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students in this batch yet.</p>
            ) : (
              rosterStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                  <span>{s.name}</span>
                  <span className="text-muted-foreground">{s.attendancePct}% attendance</span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
