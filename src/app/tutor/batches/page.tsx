import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listBatchesByTutor } from "@/lib/store/batches";
import { listStudentsByBatch } from "@/lib/store/students";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { TutorBatchesClient } from "./batches-client";

export default async function TutorBatchesPage() {
  const user = await getCurrentUser();
  const batches = (user ? listBatchesByTutor(user.userId) : []).map((batch) => ({
    ...batch,
    studentCount: listStudentsByBatch(batch.id).length,
  }));
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="tutor"
      userName={user?.fullName ?? "Tutor"}
      pageTitle="My Batches"
      notifications={notifications}
    >
      <TutorBatchesClient batches={batches} />
    </DashboardLayout>
  );
}
