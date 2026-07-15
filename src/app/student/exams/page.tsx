import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/get-current-user";
import { getStudent } from "@/lib/store/students";
import { listExamsByBatch, getAttempt, getBatchRank } from "@/lib/store/exams";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { hasEnded, hasStarted } from "@/lib/time-gate";

export default async function StudentExamsPage() {
  const user = await getCurrentUser();
  const student = user ? getStudent(user.userId) : undefined;
  const exams = student
    ? listExamsByBatch(student.batchId).sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1))
    : [];
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="student"
      userName={user?.fullName ?? "Student"}
      pageTitle="Exams & Results"
      notifications={notifications}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Exams</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {exams.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exams scheduled yet.</p>
          ) : (
            exams.map((exam) => {
              const started = hasStarted(exam.scheduledAt);
              const ended = hasEnded(exam.scheduledAt, exam.durationMinutes);
              const attempt = student ? getAttempt(exam.id, student.id) : undefined;
              const rank = student && exam.publishedAt ? getBatchRank(exam.id, student.id) : null;

              return (
                <div key={exam.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {exam.subject} · {new Date(exam.scheduledAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {exam.publishedAt ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {attempt?.score ?? 0}/{exam.totalMarks}
                        </p>
                        {rank && <p className="text-xs text-muted-foreground">Rank #{rank} in batch</p>}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link href={`/student/exams/${exam.id}/review`} />}
                      >
                        View Answers
                      </Button>
                    </div>
                  ) : !started ? (
                    <Badge variant="outline">
                      Starts {new Date(exam.scheduledAt).toLocaleString("en-IN")}
                    </Badge>
                  ) : ended ? (
                    <Badge variant="outline">
                      {attempt?.submittedAt ? "Submitted — awaiting results" : "Missed"}
                    </Badge>
                  ) : (
                    <Button size="sm" render={<Link href={`/student/exams/${exam.id}`} />}>
                      {attempt ? "Resume" : "Start"}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
