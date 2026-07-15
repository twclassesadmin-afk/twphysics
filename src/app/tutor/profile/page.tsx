import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/get-current-user";
import { getTutor } from "@/lib/store/tutors";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { TutorProfileClient } from "./profile-client";

export default async function TutorProfilePage() {
  const user = await getCurrentUser();
  const tutor = user ? getTutor(user.userId) : undefined;
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="tutor"
      userName={user?.fullName ?? "Tutor"}
      pageTitle="Profile Settings"
      notifications={notifications}
    >
      {tutor ? (
        <TutorProfileClient tutor={tutor} />
      ) : (
        <p className="text-sm text-muted-foreground">Profile not found.</p>
      )}
    </DashboardLayout>
  );
}
