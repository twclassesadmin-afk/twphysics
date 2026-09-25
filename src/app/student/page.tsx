import { CalendarClock, ListChecks, TrendingUp, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/get-current-user";
import { getStudent } from "@/lib/store/students";
import { listClassesByBatch } from "@/lib/store/classes";
import { listSyllabusByBatch } from "@/lib/store/syllabus";
import { listBroadcastsByBatch } from "@/lib/store/broadcasts";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { hasEnded } from "@/lib/time-gate";

export default async function StudentOverviewPage() {
  const user = await getCurrentUser();
  const student = user ? await getStudent(user.userId) : undefined;

  const rawClasses = student ? await listClassesByBatch(student.batchId) : [];
  const upcomingClasses = rawClasses.filter((c) => !hasEnded(c.scheduledAt, c.durationMinutes));
  const nextClass = upcomingClasses[0];

  const syllabusItems = student ? await listSyllabusByBatch(student.batchId) : [];
  const completedTopics = syllabusItems.filter((i) => i.status === "completed").length;
  const syllabusPct =
    syllabusItems.length === 0 ? 0 : Math.round((completedTopics / syllabusItems.length) * 100);

  const broadcasts = student ? await listBroadcastsByBatch(student.batchId) : [];
  const latestBroadcast = broadcasts[0];
  const notifications = user ? await listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="student"
      userName={user?.fullName ?? "Student"}
      pageTitle="Overview"
      notifications={notifications}
    >
      <WelcomeBanner
        eyebrow="Student dashboard"
        title={`Welcome back, ${(user?.fullName ?? "Student").split(" ")[0]}`}
        description={
          nextClass
            ? `Your next class is ${nextClass.subject}. Keep your streak going — every topic you close moves your progress bar.`
            : "No class scheduled right now — a great time to revise and clear pending doubts."
        }
        image="/illustrations/student-science.jpg"
        action={
          <Button size="sm" render={<Link href="/student/classes" />}>
            My classes <ArrowRight className="size-4" />
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3">
        <StatCard
          label="Next Class"
          value={nextClass ? nextClass.subject : "None"}
          icon={CalendarClock}
        />
        <StatCard
          label="Syllabus Topics Left"
          value={syllabusItems.length - completedTopics}
          icon={ListChecks}
        />
        <StatCard label="Syllabus Progress" value={`${syllabusPct}%`} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest announcement</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {latestBroadcast
            ? `${latestBroadcast.message} — ${latestBroadcast.tutorName}`
            : "No announcements from your tutor yet."}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Syllabus progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={syllabusPct} />
          <p className="text-sm text-muted-foreground">
            {completedTopics} of {syllabusItems.length} topics completed
          </p>
          <Button variant="ghost" size="sm" className="px-0" render={<Link href="/student/progress" />}>
            View full progress <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
