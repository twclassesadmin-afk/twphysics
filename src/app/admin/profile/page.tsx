import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/get-current-user";
import { listNotificationsForUser } from "@/lib/store/notifications";

export default async function AdminProfilePage() {
  const user = await getCurrentUser();
  const notifications = user ? await listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle="Profile Settings"
      notifications={notifications}
    >
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Your details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Full name</p>
            <p className="text-sm font-medium">{user?.fullName ?? "Admin User"}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{user?.email ?? "admin@twphysics.example"}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="text-sm font-medium">Administrator</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
