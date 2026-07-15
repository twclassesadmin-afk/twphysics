import { Download, FileText, Link as LinkIcon } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/get-current-user";
import { getStudent, listStudentsByBatch } from "@/lib/store/students";
import { getBatch } from "@/lib/store/batches";
import { listMaterialsByBatch } from "@/lib/store/materials";
import { listNotificationsForUser } from "@/lib/store/notifications";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function StudentCoursePage() {
  const user = await getCurrentUser();
  const student = user ? getStudent(user.userId) : undefined;
  const batch = student ? getBatch(student.batchId) : undefined;
  const batchmates = student
    ? listStudentsByBatch(student.batchId).filter((s) => s.id !== student.id)
    : [];
  const materials = student ? listMaterialsByBatch(student.batchId) : [];
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="student"
      userName={user?.fullName ?? "Student"}
      pageTitle="My Course"
      notifications={notifications}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {student?.courseName ?? "No course"} — {student?.batchName ?? "Unassigned"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          {batch ? (
            <>
              <p>Daily timing: {batch.dailyTime}</p>
              <p>Batch starts: {batch.startDate}</p>
              <p>
                Tutor: <span className="font-medium text-foreground">{batch.tutor}</span>
              </p>
            </>
          ) : (
            <p>You&apos;re not assigned to a batch yet — admin will place you soon.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Study material</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No materials shared yet.</p>
          ) : (
            materials.map((material) => {
              const Icon = material.type === "link" ? LinkIcon : FileText;
              return (
                <div key={material.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Icon className="size-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{material.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {material.uploadedBy} · {material.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<a href={material.url} target="_blank" rel="noopener noreferrer" />}
                  >
                    <Download /> {material.type === "pdf" ? "Download" : "Open"}
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Batch-mates</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {batchmates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No batch-mates yet.</p>
          ) : (
            batchmates.map((mate) => (
              <Badge key={mate.id} variant="secondary" className="gap-2 py-1.5 pl-1.5 pr-3">
                <Avatar className="size-5">
                  <AvatarFallback className="text-[10px]">{initials(mate.name)}</AvatarFallback>
                </Avatar>
                {mate.name}
              </Badge>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
