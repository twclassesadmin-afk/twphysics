import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listSyllabus } from "@/lib/store/syllabus";
import { listBatchesByTutor } from "@/lib/store/batches";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { TutorSyllabusClient } from "./syllabus-client";

export default async function TutorSyllabusPage() {
  const user = await getCurrentUser();
  const myBatches = user ? await listBatchesByTutor(user.userId) : [];
  const batchIds = myBatches.map((b) => b.id);
  const allItems = await listSyllabus();
  const items = allItems.filter((item) => batchIds.includes(item.batchId));
  const notifications = user ? await listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="tutor"
      userName={user?.fullName ?? "Tutor"}
      pageTitle="Syllabus"
      notifications={notifications}
    >
      <TutorSyllabusClient items={items} />
    </DashboardLayout>
  );
}
