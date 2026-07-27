import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { listResults, listTestimonials } from "@/lib/store/marketing";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { AdminMarketingClient } from "./marketing-client";

export default async function AdminMarketingPage() {
  const user = await getCurrentUser();
  const results = listResults();
  const testimonials = listTestimonials();
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle="Homepage Content"
      notifications={notifications}
    >
      <AdminMarketingClient results={results} testimonials={testimonials} />
    </DashboardLayout>
  );
}
