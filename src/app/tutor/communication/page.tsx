import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listBatchesByTutor } from "@/lib/store/batches";
import { listBroadcastsByTutor } from "@/lib/store/broadcasts";
import { listIssues } from "@/lib/store/issues";
import { listStudents } from "@/lib/store/students";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { TutorCommunicationClient } from "./communication-client";

export default async function TutorCommunicationPage() {
  const user = await getCurrentUser();
  const batches = user ? listBatchesByTutor(user.userId) : [];
  const batchIds = batches.map((b) => b.id);
  const myStudentIds = listStudents()
    .filter((s) => batchIds.includes(s.batchId))
    .map((s) => s.id);
  const issues = listIssues().filter(
    (i) => i.raisedByRole === "student" && myStudentIds.includes(i.raisedById),
  );
  const broadcasts = user ? listBroadcastsByTutor(user.userId) : [];
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="tutor"
      userName={user?.fullName ?? "Tutor"}
      pageTitle="Communication"
      notifications={notifications}
    >
      <TutorCommunicationClient batches={batches} broadcasts={broadcasts} issues={issues} />
    </DashboardLayout>
  );
}
