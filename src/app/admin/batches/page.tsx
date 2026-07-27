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
  const courses = listCourses().map((c) => ({ ...c, seatsLeft: getCourseSeatsLeft(c.id) }));
  const batches = listBatches().map((b) => ({ ...b, filled: getBatchFilledCount(b.id), tutors: listBatchTutors(b.id) }));
  const tutors = listTutors();
  const students = listStudents();
  const pricingTiers = listPricingTiers();
  const notifications = user ? listNotificationsForUser(user.userId) : [];

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
