import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listBatchesByTutor, subjectsForTutorInBatch } from "@/lib/store/batches";
import { listStudentsByBatch } from "@/lib/store/students";
import { listClassesByBatch } from "@/lib/store/classes";
import { listSyllabusByBatch } from "@/lib/store/syllabus";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { hasEnded } from "@/lib/time-gate";
import { TutorBatchesClient } from "./batches-client";

export default async function TutorBatchesPage() {
  const user = await getCurrentUser();
  const rawBatches = user ? await listBatchesByTutor(user.userId) : [];
  const notifications = user ? await listNotificationsForUser(user.userId) : [];
  const batches = await Promise.all(
    rawBatches.map(async (batch) => {
      const [students, classes, mySubjects, syllabusTopics] = await Promise.all([
        listStudentsByBatch(batch.id),
        listClassesByBatch(batch.id),
        user ? subjectsForTutorInBatch(user.userId, batch.id) : Promise.resolve([]),
        listSyllabusByBatch(batch.id),
      ]);
      return {
        ...batch,
        studentCount: students.length,
        upcomingClasses: classes.filter((c) => !hasEnded(c.scheduledAt, c.durationMinutes)),
        mySubjects,
        syllabusTopics,
      };
    }),
  );

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
