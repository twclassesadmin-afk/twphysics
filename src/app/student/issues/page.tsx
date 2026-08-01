import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listIssuesForUser } from "@/lib/store/issues";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { StudentIssuesClient } from "./issues-client";

export default async function StudentIssuesPage() {
  const user = await getCurrentUser();
  const issues = user ? await listIssuesForUser(user.userId) : [];
  const notifications = user ? await listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="student"
      userName={user?.fullName ?? "Student"}
      pageTitle="Issues"
      notifications={notifications}
    >
      <StudentIssuesClient issues={issues} />
    </DashboardLayout>
  );
}
