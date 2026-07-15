import Link from "next/link";
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
import { listTutors } from "@/lib/store/tutors";
import { listBatches } from "@/lib/store/batches";
import { listNotificationsForUser } from "@/lib/store/notifications";

export default async function AdminTutorsPage() {
  const user = await getCurrentUser();
  const tutors = listTutors();
  const batches = listBatches();
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle="Tutor Management"
      notifications={notifications}
    >
      <Card>
        <CardHeader>
          <CardTitle>Active Tutors</CardTitle>
        </CardHeader>
        <CardContent>
          {tutors.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No tutors yet — approve a tutor application to add one.
            </p>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="space-y-2 sm:hidden">
                {tutors.map((tutor) => {
                  const assignedBatches = batches.filter((b) => b.tutorId === tutor.id);
                  return (
                    <Link
                      key={tutor.id}
                      href={`/admin/tutors/${tutor.id}`}
                      className="block rounded-lg border p-3 text-sm"
                    >
                      <p className="font-medium">{tutor.fullName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{tutor.subjects}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {assignedBatches.length === 0
                          ? "No batches assigned"
                          : assignedBatches.map((b) => b.name).join(", ")}
                      </p>
                    </Link>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Assigned Batches</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tutors.map((tutor) => {
                      const assignedBatches = batches.filter((b) => b.tutorId === tutor.id);
                      return (
                        <TableRow key={tutor.id}>
                          <TableCell>
                            <Link
                              href={`/admin/tutors/${tutor.id}`}
                              className="font-medium underline-offset-4 hover:underline"
                            >
                              {tutor.fullName}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{tutor.subjects}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {assignedBatches.length === 0
                              ? "None"
                              : assignedBatches.map((b) => b.name).join(", ")}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{tutor.joinedAt}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
