import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listCourses, listBatches, getBatchFilledCount, getCourseSeatsLeft, listBatchTutors } from "@/lib/store/batches";
import { listTutors } from "@/lib/store/tutors";
import { listStudents } from "@/lib/store/students";
import { listPricingTiers } from "@/lib/store/pricing";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { AdminBatchesClient } from "./batches-client";

export default async function AdminBatchesPage() {
  const user = await getCurrentUser();
  const [rawCourses, rawBatches, tutors, students, pricingTiers, notifications] = await Promise.all([
    listCourses(),
    listBatches(),
    listTutors(),
    listStudents(),
    listPricingTiers(),
    user ? listNotificationsForUser(user.userId) : Promise.resolve([]),
  ]);
  const courses = await Promise.all(rawCourses.map(async (c) => ({ ...c, seatsLeft: await getCourseSeatsLeft(c.id) })));
  const batches = await Promise.all(
    rawBatches.map(async (b) => ({
      ...b,
      filled: await getBatchFilledCount(b.id),
      tutors: await listBatchTutors(b.id),
    })),
  );

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle="Batches & Courses"
      notifications={notifications}
    >
      <AdminBatchesClient
        courses={courses}
        batches={batches}
        tutors={tutors}
        students={students}
        pricingTiers={pricingTiers}
      />
    </DashboardLayout>
  );
}
