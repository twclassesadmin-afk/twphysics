import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listSyllabus } from "@/lib/store/syllabus";
import { listBatchesByTutor } from "@/lib/store/batches";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { TutorSyllabusClient } from "./syllabus-client";

export default async function TutorSyllabusPage() {
  const user = await getCurrentUser();
  const batchIds = user ? listBatchesByTutor(user.userId).map((b) => b.id) : [];
  const items = listSyllabus().filter((item) => batchIds.includes(item.batchId));
  const notifications = user ? listNotificationsForUser(user.userId) : [];

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
