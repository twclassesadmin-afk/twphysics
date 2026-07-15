import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/get-current-user";
import { getExam, listQuestionsFull, getExamResults } from "@/lib/store/exams";
import { listBatchesByTutor } from "@/lib/store/batches";
import { listStudentsByBatch } from "@/lib/store/students";
import { listNotificationsForUser } from "@/lib/store/notifications";

export default async function TutorExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = getExam(id);
  if (!exam) notFound();

  const user = await getCurrentUser();
  const myBatchIds = user ? listBatchesByTutor(user.userId).map((b) => b.id) : [];
  if (!myBatchIds.includes(exam.batchId)) notFound();

  const questions = listQuestionsFull(exam.id);
  const students = listStudentsByBatch(exam.batchId);
  const results = exam.publishedAt
    ? getExamResults(
        exam.id,
        students.map((s) => s.id),
      )
    : [];
  const notifications = user ? listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="tutor"
      userName={user?.fullName ?? "Tutor"}
      pageTitle={exam.title}
      notifications={notifications}
    >
      <Card>
        <CardHeader>
          <CardTitle>{exam.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {exam.batchName} · {new Date(exam.scheduledAt).toLocaleString("en-IN")} · {exam.durationMinutes} min ·{" "}
            {exam.totalMarks} marks
          </p>
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

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          {!exam.publishedAt ? (
            <p className="text-sm text-muted-foreground">Results not yet published.</p>
          ) : (
            <div className="space-y-2">
              {results.map((row) => {
                const student = students.find((s) => s.id === row.studentId);
                return (
                  <div key={row.studentId} className="flex items-center justify-between rounded-lg border p-2.5 text-sm">
                    <span className="font-medium">{student?.name}</span>
                    <span>{row.score === null ? "—" : `${row.score}/${exam.totalMarks}`}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
