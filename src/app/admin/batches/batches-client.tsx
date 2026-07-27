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
import type { Batch, BatchTutorAssignment, Course, PricingTier, Student, StudentCategory, Tutor } from "@/lib/store/types";
import { SUBJECTS } from "@/lib/subjects";
import {
  createCourse,
  createBatch,
  assignTutorToBatchSubject,
  editBatchTiming,
  createPricingTier,
  editPricingTier,
  deletePricingTier,
} from "./actions";

const CATEGORY_LABEL: Record<StudentCategory, string> = {
  college_going: "College-going",
  long_term: "Long-term",
};

// Client-confirmed: billed yearly in 3 equal terms (4 months each), not
// monthly — monthlyFeeInr is the unit rate a term is computed from.
const YEARLY_TERM_MONTHS = 4;

type CourseWithSeats = Course & { seatsLeft: number };
type BatchWithFilled = Batch & { filled: number; tutors: BatchTutorAssignment[] };

function blankHighlights() {
  return ["", "", "", ""];
}

function blankTierDraft() {
  return {
    batchSize: "",
    label: "",
    subjectsCount: "3",
    daysPerSubjectPerMonth: "12",
    monthlyFeeInr: "",
  };
}

export function AdminBatchesClient({
  courses,
  batches,
  tutors,
  students,
  pricingTiers,
}: {
  courses: CourseWithSeats[];
  batches: BatchWithFilled[];
  tutors: Tutor[];
  students: Student[];
  pricingTiers: PricingTier[];
}) {
  const [pending, startTransition] = useTransition();

  const [courseOpen, setCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "",
    tagline: "",
    durationMonths: "12",
  });
  const [highlights, setHighlights] = useState<string[]>(blankHighlights());

  const [batchOpen, setBatchOpen] = useState(false);
  const [newBatch, setNewBatch] = useState<{
    name: string;
    courseId: string;
    capacity: string;
    dailyTime: string;
    studentCategory: StudentCategory;
  }>({ name: "", courseId: courses[0]?.id ?? "", capacity: "60", dailyTime: "", studentCategory: "college_going" });

  const [assignBatchId, setAssignBatchId] = useState<string | null>(null);
  const [assignSubject, setAssignSubject] = useState<string>(SUBJECTS[0]);
  const [assignTutorId, setAssignTutorId] = useState("");

  const [rosterBatchId, setRosterBatchId] = useState<string | null>(null);

  const [editTimingBatchId, setEditTimingBatchId] = useState<string | null>(null);
  const [editDailyTime, setEditDailyTime] = useState("");

  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [tierDraft, setTierDraft] = useState(blankTierDraft());
  const [deleteTierId, setDeleteTierId] = useState<string | null>(null);

  function addCourse() {
    if (!newCourse.name.trim()) return;
    startTransition(async () => {
      const result = await createCourse({
        name: newCourse.name,
        tagline: newCourse.tagline,
        durationMonths: Number(newCourse.durationMonths) || 12,
        highlights,
      });
      if (result.ok) {
        toast.success("Course created");
        setNewCourse({ name: "", tagline: "", durationMonths: "12" });
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
        studentCategory: newBatch.studentCategory,
        capacity: Number(newBatch.capacity) || 0,
        dailyTime: newBatch.dailyTime || "TBD",
      });
      if (result.ok) {
        toast.success("Batch created");
        setNewBatch({ name: "", courseId: courses[0]?.id ?? "", capacity: "60", dailyTime: "", studentCategory: "college_going" });
        setBatchOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  function saveTiming() {
    if (!editTimingBatchId || !editDailyTime.trim()) return;
    startTransition(async () => {
      const result = await editBatchTiming(editTimingBatchId, editDailyTime);
      if (result.ok) {
        toast.success("Timing updated — tutor and students notified");
        setEditTimingBatchId(null);
      } else {
        toast.error(result.error);
      }
    });
  }

  function assignTutor() {
    if (!assignBatchId || !assignSubject || !assignTutorId) return;
    const tutor = tutors.find((t) => t.id === assignTutorId);
    if (!tutor) return;
    startTransition(async () => {
      const result = await assignTutorToBatchSubject(assignBatchId, assignSubject, tutor.id, tutor.fullName);
      if (result.ok) {
        toast.success(`${tutor.fullName} assigned to teach ${assignSubject} — batch notified`);
        setAssignBatchId(null);
        setAssignTutorId("");
      } else {
        toast.error(result.error);
      }
    });
  }

  const tutorsForAssignSubject = tutors.filter((t) => t.subjects.includes(assignSubject));

  function openAddTier() {
    setEditingTierId(null);
    setTierDraft(blankTierDraft());
    setTierDialogOpen(true);
  }

  function openEditTier(tier: PricingTier) {
    setEditingTierId(tier.id);
    setTierDraft({
      batchSize: String(tier.batchSize),
      label: tier.label,
      subjectsCount: String(tier.subjectsCount),
      daysPerSubjectPerMonth: String(tier.daysPerSubjectPerMonth),
      monthlyFeeInr: String(tier.monthlyFeeInr),
    });
    setTierDialogOpen(true);
  }

  function submitTier() {
    const payload = {
      batchSize: Number(tierDraft.batchSize) || 0,
      label: tierDraft.label,
      subjectsCount: Number(tierDraft.subjectsCount) || 0,
      daysPerSubjectPerMonth: Number(tierDraft.daysPerSubjectPerMonth) || 0,
      monthlyFeeInr: Number(tierDraft.monthlyFeeInr) || 0,
    };
    startTransition(async () => {
      const result = editingTierId
        ? await editPricingTier(editingTierId, payload)
        : await createPricingTier(payload);
      if (result.ok) {
        toast.success(editingTierId ? "Pricing tier updated" : "Pricing tier added");
        setTierDialogOpen(false);
        setEditingTierId(null);
      } else {
        toast.error(result.error);
      }
    });
  }

  function confirmDeleteTier() {
    if (!deleteTierId) return;
    startTransition(async () => {
      const result = await deletePricingTier(deleteTierId);
      if (result.ok) {
        toast.success("Pricing tier removed");
        setDeleteTierId(null);
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
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
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
                <div className="space-y-2">
                  <Label htmlFor="course-duration">Duration (months)</Label>
                  <Input
                    id="course-duration"
                    type="number"
                    value={newCourse.durationMonths}
                    onChange={(e) => setNewCourse({ ...newCourse, durationMonths: e.target.value })}
                  />
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
                  <Badge variant="secondary">{course.seatsLeft} seats left</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {course.tagline} · {course.durationMonths} months
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
                  <Label>Student category</Label>
                  <Select
                    value={newBatch.studentCategory}
                    onValueChange={(value) =>
                      setNewBatch({ ...newBatch, studentCategory: (value as StudentCategory) ?? "college_going" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="college_going">College-going</SelectItem>
                      <SelectItem value="long_term">Long-term</SelectItem>
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
                  <CardTitle className="flex items-center justify-between text-base">
                    {batch.name}
                    <Badge variant="outline">{CATEGORY_LABEL[batch.studentCategory]}</Badge>
                  </CardTitle>
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
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tutors by subject</p>
                    {batch.tutors.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Unassigned</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {batch.tutors.map((bt) => (
                          <Badge key={bt.id} variant="secondary">
                            {bt.subject} — {bt.tutorName}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAssignBatchId(batch.id);
                      setAssignSubject(SUBJECTS[0]);
                      setAssignTutorId("");
                    }}
                  >
                    Assign Tutor
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditTimingBatchId(batch.id);
                      setEditDailyTime(batch.dailyTime);
                    }}
                  >
                    Edit Timing
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

        <TabsContent value="pricing" className="mt-4">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Pricing</h2>
            <p className="text-sm text-muted-foreground">
              Same fee applies across every course and stream — only batch size changes the price.
              Billed yearly in 3 terms, not monthly.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={openAddTier}>
            <Plus /> Add Tier
          </Button>
        </div>
        {pricingTiers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pricing tiers set yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <Card key={tier.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    {tier.label}
                    <Badge variant="outline">{tier.batchSize} students</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {tier.subjectsCount} subjects · {tier.daysPerSubjectPerMonth} days/subject/mo
                  </p>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="font-heading text-2xl font-semibold tabular-nums">
                    ₹{(tier.monthlyFeeInr * YEARLY_TERM_MONTHS).toLocaleString("en-IN")}
                    <span className="text-sm font-normal text-muted-foreground">/term</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Billed yearly in 3 terms · ₹{tier.monthlyFeeInr.toLocaleString("en-IN")}/mo rate
                  </p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditTier(tier)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTierId(tier.id)}>
                    <Trash2 className="size-4" /> Remove
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
        </TabsContent>
      </Tabs>

      <Dialog open={assignBatchId !== null} onOpenChange={(open) => !open && setAssignBatchId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign tutor</DialogTitle>
            <DialogDescription>
              A batch can have a different tutor per subject. Assigning a subject that already has a
              tutor replaces them, and notifies the batch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={assignSubject}
                onValueChange={(value) => {
                  setAssignSubject(value ?? SUBJECTS[0]);
                  setAssignTutorId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tutor</Label>
              <Select value={assignTutorId} onValueChange={(value) => setAssignTutorId(value ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tutor" />
                </SelectTrigger>
                <SelectContent>
                  {tutorsForAssignSubject.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No tutors teach {assignSubject}
                    </SelectItem>
                  ) : (
                    tutorsForAssignSubject.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.fullName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={assignTutor} disabled={pending || !assignTutorId}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editTimingBatchId !== null} onOpenChange={(open) => !open && setEditTimingBatchId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit batch timing</DialogTitle>
            <DialogDescription>
              Notifies the batch&apos;s tutor and students that the daily timing has changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="edit-daily-time">Daily timing</Label>
            <Input
              id="edit-daily-time"
              value={editDailyTime}
              onChange={(e) => setEditDailyTime(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={saveTiming} disabled={pending || !editDailyTime.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tierDialogOpen} onOpenChange={(open) => !open && setTierDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTierId ? "Edit pricing tier" : "New pricing tier"}</DialogTitle>
            <DialogDescription>
              Shown to prospective students on the homepage and used for the tier&apos;s fee schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tier-label">Label</Label>
              <Input
                id="tier-label"
                placeholder="Group of 9"
                value={tierDraft.label}
                onChange={(e) => setTierDraft({ ...tierDraft, label: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tier-batch-size">Batch size</Label>
                <Input
                  id="tier-batch-size"
                  type="number"
                  value={tierDraft.batchSize}
                  onChange={(e) => setTierDraft({ ...tierDraft, batchSize: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier-monthly-fee">Monthly fee (₹)</Label>
                <Input
                  id="tier-monthly-fee"
                  type="number"
                  value={tierDraft.monthlyFeeInr}
                  onChange={(e) => setTierDraft({ ...tierDraft, monthlyFeeInr: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tier-subjects-count">Subjects covered</Label>
                <Input
                  id="tier-subjects-count"
                  type="number"
                  value={tierDraft.subjectsCount}
                  onChange={(e) => setTierDraft({ ...tierDraft, subjectsCount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier-days">Days/subject/month</Label>
                <Input
                  id="tier-days"
                  type="number"
                  value={tierDraft.daysPerSubjectPerMonth}
                  onChange={(e) => setTierDraft({ ...tierDraft, daysPerSubjectPerMonth: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              onClick={submitTier}
              disabled={pending || !tierDraft.label.trim() || !tierDraft.batchSize || !tierDraft.monthlyFeeInr}
            >
              {editingTierId ? "Save" : "Add Tier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTierId !== null} onOpenChange={(open) => !open && setDeleteTierId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove pricing tier?</DialogTitle>
            <DialogDescription>This removes it from the homepage pricing display.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={confirmDeleteTier} disabled={pending}>
              Remove
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
