import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listSyllabus } from "@/lib/store/syllabus";
import { listBatches } from "@/lib/store/batches";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { AdminSyllabusClient } from "./syllabus-client";

export default async function AdminSyllabusPage() {
  const user = await getCurrentUser();
  const items = await listSyllabus();
  const batches = await listBatches();
  const notifications = user ? await listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle="Syllabus"
      notifications={notifications}
    >
      <AdminSyllabusClient items={items} batches={batches} />
    </DashboardLayout>
  );
}
