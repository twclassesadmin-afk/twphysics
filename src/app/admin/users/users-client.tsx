"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
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
import type { Batch, Issue, Student, TutorApplication } from "@/lib/store/types";
import { approveTutorApplication, rejectTutorApplication, addStudentAction, assignStudentBatch, setFeePaid } from "./actions";

const TAG_LABEL: Record<string, string> = {
  topper: "Topper",
  weak: "Weak",
  focus_needed: "Focus needed",
};

const CATEGORY_LABEL: Record<string, string> = {
  college_going: "College-going",
  long_term: "Long-term",
};

const BLANK_STUDENT = {
  name: "",
  email: "",
  phone: "",
  age: "",
  parentName: "",
  parentPhone: "",
  address: "",
  batchId: "",
  password: "",
};

export function AdminUsersClient({
  students,
  batches,
  applications,
  issues,
}: {
  students: Student[];
  batches: Batch[];
  applications: TutorApplication[];
  issues: Issue[];
}) {
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ ...BLANK_STUDENT, batchId: batches[0]?.id ?? "" });
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [initialPassword, setInitialPassword] = useState("");
  const [assignBatchValue, setAssignBatchValue] = useState("");
  const [pending, startTransition] = useTransition();

  const filteredStudents = useMemo(
    () => students.filter((s) => s.name.toLowerCase().includes(search.trim().toLowerCase())),
    [students, search],
  );

  const detailStudent = students.find((s) => s.id === detailId);
  const detailIssues = detailStudent ? issues.filter((i) => i.raisedById === detailStudent.id) : [];
  const reviewApplication = applications.find((a) => a.id === reviewId);

  const addStudentValid =
    newStudent.name.trim() &&
    newStudent.email.trim() &&
    newStudent.batchId &&
    newStudent.password.trim().length >= 6;

  function addStudent() {
    if (!addStudentValid) return;
    startTransition(async () => {
      const result = await addStudentAction({ ...newStudent, age: Number(newStudent.age) || 0 });
      if (result.ok) {
        toast.success(`Student added — login: ${newStudent.email}`);
        setNewStudent({ ...BLANK_STUDENT, batchId: batches[0]?.id ?? "" });
        setAddOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  function approve() {
    if (!reviewId) return;
    startTransition(async () => {
      const result = await approveTutorApplication(reviewId, initialPassword);
      if (result.ok) {
        toast.success("Tutor approved — account provisioned");
        setReviewId(null);
        setInitialPassword("");
      } else {
        toast.error(result.error);
      }
    });
  }

  function reject() {
    if (!reviewId) return;
    startTransition(async () => {
      const result = await rejectTutorApplication(reviewId);
      if (result.ok) {
        toast("Application rejected");
        setReviewId(null);
      } else {
        toast.error(result.error);
      }
    });
  }

  function toggleFee(studentId: string, paid: boolean) {
    startTransition(async () => {
      const result = await setFeePaid(studentId, paid);
      if (result.ok) toast.success(paid ? "Marked as fee paid" : "Marked as fee pending");
      else toast.error(result.error);
    });
  }

  function assignBatch(studentId: string) {
    if (!assignBatchValue) return;
    startTransition(async () => {
      const result = await assignStudentBatch(studentId, assignBatchValue);
      if (result.ok) {
        toast.success("Batch assigned — student notified");
        setAssignBatchValue("");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Student Directory</TabsTrigger>
          <TabsTrigger value="tutors">Tutor Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:space-y-0">
              <CardTitle>Students</CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Search students..."
                  className="sm:max-w-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                  <DialogTrigger render={<Button size="sm" />}>
                    <UserPlus /> Add Student
                  </DialogTrigger>
                  <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add student manually</DialogTitle>
                      <DialogDescription>
                        For the &ldquo;finish enrollment on call&rdquo; case — creates the student
                        record and login directly. You set their password; give it to them to log in.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-student-name">Full name</Label>
                        <Input
                          id="new-student-name" placeholder="e.g. Ravi Kumar"
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="new-student-email">Email</Label>
                          <Input
                            id="new-student-email" placeholder="student@example.com"
                            type="email"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-student-phone">Phone</Label>
                          <Input
                            id="new-student-phone" placeholder="10-digit mobile number"
                            type="tel"
                            value={newStudent.phone}
                            onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="new-student-age">Age</Label>
                          <Input
                            id="new-student-age" placeholder="e.g. 17"
                            type="number"
                            value={newStudent.age}
                            onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-student-password">Set password</Label>
                          <Input
                            id="new-student-password"
                            placeholder="At least 6 characters"
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="new-student-parent-name">Parent/guardian name</Label>
                          <Input
                            id="new-student-parent-name" placeholder="Parent or guardian name"
                            value={newStudent.parentName}
                            onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-student-parent-phone">Parent/guardian phone</Label>
                          <Input
                            id="new-student-parent-phone" placeholder="Parent’s 10-digit mobile number"
                            type="tel"
                            value={newStudent.parentPhone}
                            onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-student-address">Address</Label>
                        <Textarea
                          id="new-student-address" placeholder="House no., street, city, PIN code"
                          rows={2}
                          value={newStudent.address}
                          onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Batch</Label>
                        <Select
                          items={batches.map((b) => ({ value: b.id, label: `${b.name} (${b.course})` }))}
                          value={newStudent.batchId}
                          onValueChange={(value) => setNewStudent({ ...newStudent, batchId: value ?? "" })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {batches.map((b) => (
                              <SelectItem key={b.id} value={b.id}>
                                {b.name} ({b.course})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                      <Button onClick={addStudent} disabled={!addStudentValid || pending}>
                        Add Student
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No students match &ldquo;{search}&rdquo;.
                </p>
              ) : (
                <>
                  {/* Mobile card list */}
                  <div className="space-y-2 sm:hidden">
                    {filteredStudents.map((student) => (
                      <button
                        key={student.id}
                        className="block w-full rounded-lg border p-3 text-left text-sm"
                        onClick={() => setDetailId(student.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{student.name}</span>
                          <Badge variant={student.status === "active" ? "secondary" : "destructive"}>
                            {student.status === "active" ? "Active" : "Expiring soon"}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{student.batchName}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>{student.attendancePct}% attendance</span>
                          <FeeBadge paid={student.feePaid} />
                          {student.tag && <Badge variant="outline">{TAG_LABEL[student.tag]}</Badge>}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead>Fee</TableHead>
                          <TableHead>Tag</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
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
                            <TableCell>
                              <Badge variant={student.status === "active" ? "secondary" : "destructive"}>
                                {student.status === "active" ? "Active" : "Expiring soon"}
                              </Badge>
                            </TableCell>
                            <TableCell>{student.attendancePct}%</TableCell>
                            <TableCell>
                              <FeeBadge paid={student.feePaid} />
                            </TableCell>
                            <TableCell>
                              {student.tag ? <Badge variant="outline">{TAG_LABEL[student.tag]}</Badge> : "—"}
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
        </TabsContent>

        <TabsContent value="tutors" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tutor Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile card list */}
              <div className="space-y-2 sm:hidden">
                {applications.map((application) => (
                  <div key={application.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{application.fullName}</span>
                      <Badge
                        variant={
                          application.status === "approved"
                            ? "secondary"
                            : application.status === "rejected"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {application.status === "approved"
                          ? "Approved"
                          : application.status === "rejected"
                            ? "Rejected"
                            : "Pending"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {application.subjects.join(", ")} · {application.experience} · {application.submittedAt}
                    </p>
                    {application.status === "pending" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 w-full"
                        onClick={() => setReviewId(application.id)}
                      >
                        View &amp; Decide
                      </Button>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {application.status === "approved" ? "Provisioned" : "Closed"}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">{application.fullName}</TableCell>
                        <TableCell>{application.subjects.join(", ")}</TableCell>
                        <TableCell>{application.experience}</TableCell>
                        <TableCell className="text-muted-foreground">{application.submittedAt}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              application.status === "approved"
                                ? "secondary"
                                : application.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {application.status === "approved"
                              ? "Approved"
                              : application.status === "rejected"
                                ? "Rejected"
                                : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {application.status === "pending" ? (
                            <Button size="sm" variant="outline" onClick={() => setReviewId(application.id)}>
                              View &amp; Decide
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {application.status === "approved" ? "Provisioned" : "Closed"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student drill-down */}
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
                  {!detailStudent.batchId && (
                    <div className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                      <p className="text-sm font-medium text-destructive">No batch assigned yet</p>
                      <div className="flex gap-2">
                        <Select
                          items={batches
                            .filter((b) => b.courseId === detailStudent.courseId)
                            .map((b) => ({ value: b.id, label: b.name }))}
                          value={assignBatchValue}
                          onValueChange={(value) => setAssignBatchValue(value ?? "")}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Choose a batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {batches
                              .filter((b) => b.courseId === detailStudent.courseId)
                              .map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                  {b.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" disabled={!assignBatchValue || pending} onClick={() => assignBatch(detailStudent.id)}>
                          Assign
                        </Button>
                      </div>
                    </div>
                  )}
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
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p>{detailStudent.status === "active" ? "Active" : "Expiring soon"}</p>
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
                    {detailStudent.address && (
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p>{detailStudent.address}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="mt-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-3 text-sm">
                      <p className="text-xs text-muted-foreground">Attendance</p>
                      <p className="font-semibold">{detailStudent.attendancePct}%</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Fee (collected offline)</p>
                        <FeeBadge paid={detailStudent.feePaid} />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() => toggleFee(detailStudent.id, !detailStudent.feePaid)}
                      >
                        {detailStudent.feePaid ? "Mark pending" : "Mark paid"}
                      </Button>
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

                <TabsContent value="notes" className="mt-4 space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium">Flags</p>
                    {detailStudent.flags.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No flags raised.</p>
                    ) : (
                      <div className="space-y-2">
                        {detailStudent.flags.map((flag) => (
                          <div key={flag.id} className="rounded-lg border p-2 text-sm">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{TAG_LABEL[flag.type]}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {flag.authorName} · {flag.createdAt}
                              </span>
                            </div>
                            {flag.note && <p className="mt-1 text-muted-foreground">{flag.note}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
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
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Tutor application review */}
      <Dialog
        open={reviewId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReviewId(null);
            setInitialPassword("");
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {reviewApplication && (
            <>
              <DialogHeader>
                <DialogTitle>{reviewApplication.fullName}</DialogTitle>
                <DialogDescription>Application submitted {reviewApplication.submittedAt}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p>{reviewApplication.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p>{reviewApplication.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subjects</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {reviewApplication.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p>{reviewApplication.experience}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Qualifications</p>
                  <p>{reviewApplication.qualifications}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Availability</p>
                  <p>{reviewApplication.availability}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bio</p>
                <p className="text-sm">{reviewApplication.bio}</p>
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                <Label htmlFor="initial-password">Set initial password (to approve)</Label>
                <Input
                  id="initial-password"
                  type="text"
                  placeholder="At least 6 characters"
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The tutor logs in at /login with {reviewApplication.email} and this password.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={reject} disabled={pending}>
                  Reject
                </Button>
                <Button onClick={approve} disabled={pending || initialPassword.trim().length < 6}>
                  Approve &amp; Provision Account
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function FeeBadge({ paid }: { paid: boolean }) {
  return paid ? (
    <Badge variant="secondary" className="bg-success/15 text-success">Fee paid</Badge>
  ) : (
    <Badge variant="outline">Fee pending</Badge>
  );
}
