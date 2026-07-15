import { Trophy } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/get-current-user";
import { getStudent, listStudentsByBatch } from "@/lib/store/students";
import { listNotificationsForUser } from "@/lib/store/notifications";

export default async function StudentLeaderboardPage() {
  const user = await getCurrentUser();
  const student = user ? getStudent(user.userId) : undefined;
  const ranked = student
    ? listStudentsByBatch(student.batchId)
        .slice()
        .sort((a, b) => b.lastScore - a.lastScore)
    : [];
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="student"
      userName={user?.fullName ?? "Student"}
      pageTitle="Leaderboard"
      notifications={notifications}
    >
      <Card>
        <CardHeader>
          <CardTitle>{student?.batchName ?? "Your batch"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ranked.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scores recorded in your batch yet.</p>
          ) : (
            ranked.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.id === student?.id;
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3",
                    isCurrentUser && "border-primary bg-primary/5",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                      {rank <= 3 ? <Trophy className="size-4 text-primary" /> : rank}
                    </div>
                    <p className="text-sm font-medium">
                      {isCurrentUser ? "You" : entry.name}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{entry.lastScore}</p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
