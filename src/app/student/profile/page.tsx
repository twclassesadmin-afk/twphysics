import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { getStudent } from "@/lib/store/students";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { StudentProfileClient } from "./profile-client";

export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  const student = user ? await getStudent(user.userId) : undefined;
  const notifications = user ? await listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="student"
      userName={user?.fullName ?? "Student"}
      pageTitle="Profile Settings"
      notifications={notifications}
    >
      {student ? (
        <StudentProfileClient student={student} />
      ) : (
        <p className="text-sm text-muted-foreground">Profile not found.</p>
      )}
    </DashboardLayout>
  );
}
