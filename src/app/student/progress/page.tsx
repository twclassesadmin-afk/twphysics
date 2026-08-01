import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/get-current-user";
import { getStudent } from "@/lib/store/students";
import { listSyllabusByBatch } from "@/lib/store/syllabus";
import { listNotificationsForUser } from "@/lib/store/notifications";

const STATUS_VARIANT: Record<string, "secondary" | "outline" | "destructive"> = {
  completed: "secondary",
  in_progress: "outline",
  not_started: "destructive",
};

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  in_progress: "In progress",
  not_started: "Not started",
};

export default async function StudentProgressPage() {
  const user = await getCurrentUser();
  const student = user ? await getStudent(user.userId) : undefined;
  const syllabusItems = student ? await listSyllabusByBatch(student.batchId) : [];
  const notifications = user ? await listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="student"
      userName={user?.fullName ?? "Student"}
      pageTitle="Progress"
      notifications={notifications}
    >
      <Tabs defaultValue="syllabus">
        <TabsList>
          <TabsTrigger value="syllabus">Syllabus Completion</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="syllabus" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Syllabus completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {syllabusItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No syllabus published for your batch yet.</p>
              ) : (
                syllabusItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.topic}</p>
                      <p className="text-xs text-muted-foreground">{item.subject}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[item.status]}>{STATUS_LABEL[item.status]}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Progress value={student?.attendancePct ?? 0} />
                <p className="mt-1 text-sm text-muted-foreground">
                  {student?.attendancePct ?? 0}% overall attendance
                </p>
              </div>
              <div className="space-y-2">
                {(student?.attendanceLog ?? []).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {entry.date} · {entry.subject}
                    </span>
                    <Badge variant={entry.attended ? "secondary" : "destructive"}>
                      {entry.attended ? "Attended" : "Missed"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
