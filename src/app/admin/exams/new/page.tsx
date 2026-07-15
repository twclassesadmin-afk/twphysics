import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listBatches } from "@/lib/store/batches";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { ExamBuilder } from "./exam-builder";

export default async function NewExamPage() {
  const user = await getCurrentUser();
  const batches = listBatches();
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle="Create Exam"
      notifications={notifications}
    >
      <ExamBuilder batches={batches} />
    </DashboardLayout>
  );
}
