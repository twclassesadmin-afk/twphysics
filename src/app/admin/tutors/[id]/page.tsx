import { notFound } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/get-current-user";
import { getTutor, countClassesCompletedForTutor } from "@/lib/store/tutors";
import { listBatches, getBatchFilledCount } from "@/lib/store/batches";
import { listStudents } from "@/lib/store/students";
import { listExamsByBatch } from "@/lib/store/exams";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { ResetPasswordDialog } from "../reset-password-dialog";

export default async function AdminTutorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tutor = getTutor(id);
  if (!tutor) notFound();

  const user = await getCurrentUser();
  const assignedBatches = listBatches().filter((b) => b.tutorId === tutor.id);
  const batchIds = assignedBatches.map((b) => b.id);
  const students = listStudents().filter((s) => batchIds.includes(s.batchId));
  const exams = batchIds.flatMap((batchId) => listExamsByBatch(batchId));
  const classesCompleted = countClassesCompletedForTutor(tutor.id);
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle={tutor.fullName}
      notifications={notifications}
    >
      <Card>
        <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:space-y-0">
          <CardTitle>Profile</CardTitle>
          <ResetPasswordDialog tutorId={tutor.id} tutorEmail={tutor.email} />
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p>{tutor.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p>{tutor.phone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Subjects</p>
            <p>{tutor.subjects}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Qualifications</p>
            <p>{tutor.qualifications}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Availability</p>
            <p>{tutor.availability}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Joined</p>
            <p>{tutor.joinedAt}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Bio</p>
            <p>{tutor.bio}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assigned batches</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{assignedBatches.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Classes completed</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{classesCompleted}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Students taught</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{students.length}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batches</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedBatches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No batches assigned yet.</p>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="space-y-2 sm:hidden">
                {assignedBatches.map((batch) => (
                  <div key={batch.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{batch.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {batch.course} · {batch.dailyTime}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getBatchFilledCount(batch.id)}/{batch.capacity} filled
                    </p>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Timing</TableHead>
                      <TableHead>Filled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.name}</TableCell>
                        <TableCell className="text-muted-foreground">{batch.course}</TableCell>
                        <TableCell className="text-muted-foreground">{batch.dailyTime}</TableCell>
                        <TableCell>
                          {getBatchFilledCount(batch.id)}/{batch.capacity}
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

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students under this tutor yet.</p>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                  <span>
                    {student.name} <span className="text-muted-foreground">· {student.batchName}</span>
                  </span>
                  <span className="text-muted-foreground">{student.attendancePct}% attendance</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exams for this tutor&apos;s batches yet.</p>
          ) : (
            <div className="space-y-2">
              {exams.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/admin/exams/${exam.id}`}
                  className="flex items-center justify-between rounded-lg border p-2 text-sm hover:bg-accent"
                >
                  <span>
                    {exam.title} <span className="text-muted-foreground">· {exam.batchName}</span>
                  </span>
                  <Badge variant={exam.publishedAt ? "secondary" : "outline"}>
                    {exam.publishedAt ? "Published" : "Not published"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
