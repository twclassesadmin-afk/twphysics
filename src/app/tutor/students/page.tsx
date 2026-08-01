import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listStudents } from "@/lib/store/students";
import { listBatchesByTutor } from "@/lib/store/batches";
import { listIssues } from "@/lib/store/issues";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { TutorStudentsClient } from "./students-client";

export default async function TutorStudentsPage() {
  const user = await getCurrentUser();
  const [myBatches, allStudents, issues, notifications] = await Promise.all([
    user ? listBatchesByTutor(user.userId) : Promise.resolve([]),
    listStudents(),
    listIssues(),
    user ? listNotificationsForUser(user.userId) : Promise.resolve([]),
  ]);
  const myBatchIds = myBatches.map((b) => b.id);
  const students = allStudents.filter((s) => myBatchIds.includes(s.batchId));

  return (
    <DashboardLayout
      role="tutor"
      userName={user?.fullName ?? "Tutor"}
      pageTitle="Students"
      notifications={notifications}
    >
      <TutorStudentsClient students={students} issues={issues} />
    </DashboardLayout>
  );
}
