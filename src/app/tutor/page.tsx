import { Layers, CalendarClock, ListChecks, MessageSquare, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/get-current-user";
import { listBatchesByTutor } from "@/lib/store/batches";
import { listClassesByTutor } from "@/lib/store/classes";
import { listSyllabus } from "@/lib/store/syllabus";
import { listIssues } from "@/lib/store/issues";
import { listStudents } from "@/lib/store/students";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { hasEnded } from "@/lib/time-gate";

export default async function TutorOverviewPage() {
  const user = await getCurrentUser();
  const [batches, rawUpcoming, syllabus, allStudents, allIssues, notifications] = await Promise.all([
    user ? listBatchesByTutor(user.userId) : Promise.resolve([]),
    user ? listClassesByTutor(user.userId) : Promise.resolve([]),
    listSyllabus(),
    listStudents(),
    listIssues(),
    user ? listNotificationsForUser(user.userId) : Promise.resolve([]),
  ]);
  const batchIds = batches.map((b) => b.id);
  const upcomingClasses = rawUpcoming.filter((c) => !hasEnded(c.scheduledAt, c.durationMinutes));
  const pendingSyllabus = syllabus.filter(
    (item) => batchIds.includes(item.batchId) && item.status !== "completed",
  );
  const myStudentIds = allStudents.filter((s) => batchIds.includes(s.batchId)).map((s) => s.id);
  const openIssues = allIssues.filter(
    (i) => i.raisedByRole === "student" && myStudentIds.includes(i.raisedById) && i.status !== "resolved",
  );

  return (
    <DashboardLayout
      role="tutor"
      userName={user?.fullName ?? "Tutor"}
      pageTitle="Overview"
      notifications={notifications}
    >
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3">
        <StatCard label="My Batches" value={batches.length} icon={Layers} />
        <StatCard label="Upcoming Classes" value={upcomingClasses.length} icon={CalendarClock} />
        <StatCard
          label="Pending Syllabus Items"
          value={pendingSyllabus.length}
          icon={ListChecks}
          tone="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My batches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No batches assigned yet.</p>
          ) : (
            batches.map((batch) => {
              const nextClass = upcomingClasses.find((c) => c.batchId === batch.id);
              return (
                <div key={batch.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{batch.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {nextClass
                        ? `Next: ${nextClass.subject} — ${new Date(nextClass.scheduledAt).toLocaleString("en-IN")}`
                        : `Daily ${batch.dailyTime} — no class scheduled`}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" render={<Link href="/tutor/batches" />}>
                    View <ArrowRight className="size-4" />
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="size-4" /> Unread from students
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {openIssues.length === 0 ? (
            "No unread issues right now — nice work staying on top of it."
          ) : (
            <span>
              {openIssues.length} open issue{openIssues.length > 1 ? "s" : ""} from your students —{" "}
              <Link href="/tutor/communication" className="underline underline-offset-4">
                reply now
              </Link>
              .
            </span>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
