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
  const batches = (user ? listBatchesByTutor(user.userId) : []).map((batch) => ({
    ...batch,
    studentCount: listStudentsByBatch(batch.id).length,
    upcomingClasses: listClassesByBatch(batch.id).filter((c) => !hasEnded(c.scheduledAt, c.durationMinutes)),
    mySubjects: user ? subjectsForTutorInBatch(user.userId, batch.id) : [],
    syllabusTopics: listSyllabusByBatch(batch.id),
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
