import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/get-current-user";
import { listBatchesByTutor } from "@/lib/store/batches";
import { listExamsByBatch } from "@/lib/store/exams";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { hasEnded, hasStarted } from "@/lib/time-gate";

function examStatus(scheduledAt: string, durationMinutes: number, publishedAt: string | null) {
  if (publishedAt) return { label: "Results published", variant: "secondary" as const };
  if (hasEnded(scheduledAt, durationMinutes)) return { label: "Grading", variant: "outline" as const };
  if (hasStarted(scheduledAt)) return { label: "Open", variant: "default" as const };
  return { label: "Scheduled", variant: "outline" as const };
}

export default async function TutorExamsPage() {
  const user = await getCurrentUser();
  const batchIds = user ? listBatchesByTutor(user.userId).map((b) => b.id) : [];
  const exams = batchIds
    .flatMap((batchId) => listExamsByBatch(batchId))
    .sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1));
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="tutor"
      userName={user?.fullName ?? "Tutor"}
      pageTitle="Exams"
      notifications={notifications}
    >
      <Card>
        <CardHeader>
          <CardTitle>Exams across your batches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {exams.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exams scheduled for your batches yet.</p>
          ) : (
            exams.map((exam) => {
              const status = examStatus(exam.scheduledAt, exam.durationMinutes, exam.publishedAt);
              return (
                <Link
                  key={exam.id}
                  href={`/tutor/exams/${exam.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                >
                  <div>
                    <p className="text-sm font-medium">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {exam.batchName} · {new Date(exam.scheduledAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
