import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/get-current-user";
import { getStudent } from "@/lib/store/students";
import { getExam, listQuestionsForAttempt, getAttempt, startAttempt } from "@/lib/store/exams";
import { listNotificationsForUser } from "@/lib/store/notifications";
import { hasEnded, hasStarted } from "@/lib/time-gate";
import { ExamAttemptClient } from "./exam-attempt-client";

export default async function StudentExamAttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = getExam(id);
  if (!exam) notFound();

  const user = await getCurrentUser();
  const student = user ? getStudent(user.userId) : undefined;
  if (!student || student.batchId !== exam.batchId) notFound();

  const notifications = user ? listNotificationsForUser(user.userId) : [];
  const started = hasStarted(exam.scheduledAt);
  const ended = hasEnded(exam.scheduledAt, exam.durationMinutes);

  if (!started) {
    return (
      <DashboardLayout role="student" userName={student.name} pageTitle={exam.title} notifications={notifications}>
        <Card>
          <CardHeader>
            <CardTitle>{exam.title} hasn&apos;t started yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This exam starts at {new Date(exam.scheduledAt).toLocaleString("en-IN")}. Come back then.
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const existingAttempt = getAttempt(exam.id, student.id);

  if (ended || existingAttempt?.submittedAt) {
    return (
      <DashboardLayout role="student" userName={student.name} pageTitle={exam.title} notifications={notifications}>
        <Card>
          <CardHeader>
            <CardTitle>{existingAttempt?.submittedAt ? "Already submitted" : "This exam has closed"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {existingAttempt?.submittedAt
              ? "Your answers were recorded. Results appear here once the admin publishes them."
              : "The submission window for this exam has ended."}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const start = startAttempt(exam.id, student.id);
  if (!start.ok) notFound();

  const questions = listQuestionsForAttempt(exam.id);

  return (
    <DashboardLayout role="student" userName={student.name} pageTitle={exam.title} notifications={notifications}>
      <ExamAttemptClient
        examId={exam.id}
        title={exam.title}
        scheduledAt={exam.scheduledAt}
        durationMinutes={exam.durationMinutes}
        questions={questions}
        initialAnswers={start.attempt.answers}
      />
    </DashboardLayout>
  );
}
