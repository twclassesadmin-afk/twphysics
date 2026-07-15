import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listDemoRequests } from "@/lib/store/demo-requests";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { DemoRequestsClient } from "./demo-requests-client";

export default async function AdminDemoRequestsPage() {
  const user = await getCurrentUser();
  const requests = listDemoRequests();
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle="Demo Requests"
      notifications={notifications}
    >
      <DemoRequestsClient requests={requests} />
    </DashboardLayout>
  );
}
