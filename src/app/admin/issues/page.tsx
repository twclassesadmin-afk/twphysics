import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listIssues } from "@/lib/store/issues";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { AdminIssuesClient } from "./issues-client";

export default async function AdminIssuesPage() {
  const user = await getCurrentUser();
  const issues = listIssues();
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle="Issues"
      notifications={notifications}
    >
      <AdminIssuesClient issues={issues} />
    </DashboardLayout>
  );
}
