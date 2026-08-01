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
  const batches = user ? await listBatchesByTutor(user.userId) : [];
  const batchIds = batches.map((b) => b.id);
  const allStudents = await listStudents();
  const myStudentIds = allStudents.filter((s) => batchIds.includes(s.batchId)).map((s) => s.id);
  const allIssues = await listIssues();
  const issues = allIssues.filter((i) => i.raisedByRole === "student" && myStudentIds.includes(i.raisedById));
  const broadcasts = user ? await listBroadcastsByTutor(user.userId) : [];
  const notifications = user ? await listNotificationsForUser(user.userId) : [];

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
