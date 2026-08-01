import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listStudents } from "@/lib/store/students";
import { listBatches } from "@/lib/store/batches";
import { listTutorApplications } from "@/lib/store/tutors";
import { listIssues } from "@/lib/store/issues";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { AdminUsersClient } from "./users-client";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  const [students, batches, applications, issues, notifications] = await Promise.all([
    listStudents(),
    listBatches(),
    listTutorApplications(),
    listIssues(),
    user ? listNotificationsForUser(user.userId) : Promise.resolve([]),
  ]);

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle="Users"
      notifications={notifications}
    >
      <AdminUsersClient students={students} batches={batches} applications={applications} issues={issues} />
    </DashboardLayout>
  );
}
