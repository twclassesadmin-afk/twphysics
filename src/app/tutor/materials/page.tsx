import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listBatchesByTutor } from "@/lib/store/batches";
import { listMaterialsByBatches } from "@/lib/store/materials";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { TutorMaterialsClient } from "./materials-client";

export default async function TutorMaterialsPage() {
  const user = await getCurrentUser();
  const batches = user ? await listBatchesByTutor(user.userId) : [];
  const materials = await listMaterialsByBatches(batches.map((b) => b.id));
  const notifications = user ? await listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="tutor"
      userName={user?.fullName ?? "Tutor"}
      pageTitle="Study Material"
      notifications={notifications}
    >
      <TutorMaterialsClient materials={materials} batches={batches} />
    </DashboardLayout>
  );
}
