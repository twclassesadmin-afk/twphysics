import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/get-current-user";
import { getExam, listQuestionsFull, getExamResults } from "@/lib/store/exams";
import { listStudentsByBatch } from "@/lib/store/students";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { ExamDetailActions } from "./exam-detail-actions";

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  submitted: "Submitted",
  auto_submitted: "Auto-submitted",
};

export default async function AdminExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = getExam(id);
  if (!exam) notFound();

  const user = await getCurrentUser();
  const questions = listQuestionsFull(exam.id);
  const students = listStudentsByBatch(exam.batchId);
  const results = getExamResults(
    exam.id,
    students.map((s) => s.id),
  );
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle={exam.title}
      notifications={notifications}
    >
      <Card>
        <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:space-y-0">
          <div>
            <CardTitle>{exam.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {exam.batchName} · {new Date(exam.scheduledAt).toLocaleString("en-IN")} · {exam.durationMinutes} min ·{" "}
              {exam.totalMarks} marks
            </p>
          </div>
          <ExamDetailActions
            examId={exam.id}
            batchId={exam.batchId}
            title={exam.title}
            isPublished={Boolean(exam.publishedAt)}
          />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile card list */}
          <div className="space-y-2 sm:hidden">
            {results.map((row) => {
              const student = students.find((s) => s.id === row.studentId);
              return (
                <div key={row.studentId} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{student?.name}</p>
                    <Badge variant={row.status === "not_started" ? "outline" : "secondary"} className="mt-1">
                      {STATUS_LABEL[row.status]}
                    </Badge>
                  </div>
                  <span className="font-medium">
                    {row.score === null ? "—" : `${row.score}/${exam.totalMarks}`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row) => {
                  const student = students.find((s) => s.id === row.studentId);
                  return (
                    <TableRow key={row.studentId}>
                      <TableCell className="font-medium">{student?.name}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === "not_started" ? "outline" : "secondary"}>
                          {STATUS_LABEL[row.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {row.score === null ? "—" : `${row.score}/${exam.totalMarks}`}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paper</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-lg border p-3">
              <p className="text-sm font-medium">
                {index + 1}. {question.text}{" "}
                <span className="text-xs text-muted-foreground">
                  ({question.marks} marks{question.negativeMarks > 0 ? `, -${question.negativeMarks}` : ""})
                </span>
              </p>
              <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                {question.options.map((option, optionIndex) => (
                  <p
                    key={optionIndex}
                    className={optionIndex === question.correctOptionIndex ? "font-medium text-success" : ""}
                  >
                    {String.fromCharCode(65 + optionIndex)}. {option}
                    {optionIndex === question.correctOptionIndex ? " ✓" : ""}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
