import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { listExams } from "@/lib/store/exams";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { hasEnded, hasStarted } from "@/lib/time-gate";

function examStatus(scheduledAt: string, durationMinutes: number, publishedAt: string | null) {
  if (publishedAt) return { label: "Results published", variant: "secondary" as const };
  if (hasEnded(scheduledAt, durationMinutes)) return { label: "Grading", variant: "outline" as const };
  if (hasStarted(scheduledAt)) return { label: "Open", variant: "default" as const };
  return { label: "Scheduled", variant: "outline" as const };
}

export default async function AdminExamsPage() {
  const user = await getCurrentUser();
  const exams = listExams().sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1));
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle="Exams"
      notifications={notifications}
    >
      <Card>
        <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:space-y-0">
          <CardTitle>All Exams</CardTitle>
          <Button size="sm" render={<Link href="/admin/exams/new" />}>
            <Plus /> Create Exam
          </Button>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No exams yet.</p>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="space-y-2 sm:hidden">
                {exams.map((exam) => {
                  const status = examStatus(exam.scheduledAt, exam.durationMinutes, exam.publishedAt);
                  return (
                    <Link
                      key={exam.id}
                      href={`/admin/exams/${exam.id}`}
                      className="block rounded-lg border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{exam.title}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {exam.batchName} · {new Date(exam.scheduledAt).toLocaleString("en-IN")}
                      </p>
                    </Link>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Starts</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => {
                      const status = examStatus(exam.scheduledAt, exam.durationMinutes, exam.publishedAt);
                      return (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">{exam.title}</TableCell>
                          <TableCell className="text-muted-foreground">{exam.batchName}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(exam.scheduledAt).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" render={<Link href={`/admin/exams/${exam.id}`} />}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
