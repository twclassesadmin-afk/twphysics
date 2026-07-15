import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/get-current-user";
import { listActivity } from "@/lib/store/activity";
import { listNotificationsForUser } from "@/lib/store/notifications";

export default async function AdminActivityPage() {
  const user = await getCurrentUser();
  const activityLog = listActivity();
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle="Activity Log"
      notifications={notifications}
    >
      <Card>
        <CardHeader>
          <CardTitle>Global Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile card list */}
          <div className="space-y-2 sm:hidden">
            {activityLog.map((entry) => (
              <div key={entry.id} className="rounded-lg border p-3 text-sm">
                <p>
                  <span className="font-medium">{entry.actor}</span> {entry.action}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {entry.target} · {entry.at}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.actor}</TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.target}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{entry.at}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
