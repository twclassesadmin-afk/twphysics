import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listBatchesByTutor, subjectsForTutorInBatch } from "@/lib/store/batches";
import { listStudentsByBatch, listRecentAttendanceForStudents } from "@/lib/store/students";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { TutorAttendanceClient } from "./attendance-client";

const LOOKBACK_DAYS = 30;

export default async function TutorAttendancePage() {
  const user = await getCurrentUser();
  const rawBatches = user ? await listBatchesByTutor(user.userId) : [];

  const batches = await Promise.all(
    rawBatches.map(async (batch) => {
      const [subjects, roster] = await Promise.all([
        user ? subjectsForTutorInBatch(user.userId, batch.id) : Promise.resolve([]),
        listStudentsByBatch(batch.id),
      ]);
      return {
        id: batch.id,
        name: batch.name,
        subjects,
        roster: roster.map((s) => ({ id: s.id, name: s.name })),
      };
    }),
  );
  const teachableBatches = batches.filter((b) => b.subjects.length > 0);

  const allStudentIds = teachableBatches.flatMap((b) => b.roster.map((s) => s.id));
  const sinceDate = new Date(new Date().getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const marks = await listRecentAttendanceForStudents(allStudentIds, sinceDate);

  const notifications = user ? await listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="tutor"
      userName={user?.fullName ?? "Tutor"}
      pageTitle="Attendance"
      notifications={notifications}
    >
      <TutorAttendanceClient batches={teachableBatches} marks={marks} />
    </DashboardLayout>
  );
}
