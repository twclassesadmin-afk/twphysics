import { Users, GraduationCap, AlertCircle, Flag, ListChecks, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/get-current-user";
import { listStudents } from "@/lib/store/students";
import { listTutors, listTutorApplications } from "@/lib/store/tutors";
import { listIssues } from "@/lib/store/issues";
import { listSyllabus } from "@/lib/store/syllabus";
import { listNotificationsForUser } from "@/lib/store/notifications";

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  const students = listStudents();
  const tutors = listTutors();
  const openIssues = listIssues().filter((i) => i.status !== "resolved");
  const pendingApplications = listTutorApplications().filter((a) => a.status === "pending");
  const flaggedStudents = students.filter((s) => s.tag === "weak" || s.tag === "focus_needed");
  const behindBatches = new Set(
    listSyllabus()
      .filter((item) => item.status !== "completed" && new Date(item.deadline) < new Date())
      .map((item) => item.batchId),
  );
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  const needsAttention = [
    flaggedStudents.length > 0 && {
      id: "flagged",
      icon: Flag,
      label: `${flaggedStudents.length} student${flaggedStudents.length > 1 ? "s" : ""} flagged by tutors`,
      href: "/admin/users",
    },
    behindBatches.size > 0 && {
      id: "syllabus",
      icon: ListChecks,
      label: `${behindBatches.size} batch${behindBatches.size > 1 ? "es" : ""} behind on syllabus deadlines`,
      href: "/admin/syllabus",
    },
    openIssues.length > 0 && {
      id: "issues",
      icon: AlertCircle,
      label: `${openIssues.length} unresolved issue${openIssues.length > 1 ? "s" : ""}`,
      href: "/admin/issues",
    },
    pendingApplications.length > 0 && {
      id: "applications",
      icon: GraduationCap,
      label: `${pendingApplications.length} tutor application${pendingApplications.length > 1 ? "s" : ""} pending review`,
      href: "/admin/users",
    },
  ].filter((item): item is Exclude<typeof item, false> => Boolean(item));

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle="Overview"
      notifications={notifications}
    >
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
        <StatCard label="Total Students" value={students.length} icon={Users} />
        <StatCard label="Active Tutors" value={tutors.length} icon={GraduationCap} />
        <StatCard label="Open Issues" value={openIssues.length} icon={AlertCircle} tone="warning" />
        <StatCard label="Flagged Students" value={flaggedStudents.length} icon={Flag} tone="warning" />
        <StatCard label="Batches Behind Syllabus" value={behindBatches.size} icon={ListChecks} tone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Needs attention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {needsAttention.length === 0 ? (
            <p className="text-sm text-muted-foreground">All clear — nothing needs attention right now.</p>
          ) : (
            needsAttention.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <item.icon className="size-4 text-destructive" />
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
                <Button variant="ghost" size="sm" render={<Link href={item.href} />}>
                  Review <ArrowRight className="size-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
