import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { getStudent } from "@/lib/store/students";
import { listClassesByBatch } from "@/lib/store/classes";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { hasEnded, hasStarted } from "@/lib/time-gate";
import { StudentClassesClient } from "./classes-client";

export default async function StudentClassesPage() {
  const user = await getCurrentUser();
  const student = user ? await getStudent(user.userId) : undefined;
  const rawClasses = student ? await listClassesByBatch(student.batchId) : [];
  const classes = rawClasses.map((cls) => ({
    ...cls,
    started: hasStarted(cls.scheduledAt),
    ended: hasEnded(cls.scheduledAt, cls.durationMinutes),
  }));
  const notifications = user ? await listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="student"
      userName={user?.fullName ?? "Student"}
      pageTitle="Classes"
      notifications={notifications}
    >
      <StudentClassesClient classes={classes} />
    </DashboardLayout>
  );
}
