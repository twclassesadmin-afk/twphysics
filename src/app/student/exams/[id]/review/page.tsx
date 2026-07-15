import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/get-current-user";
import { getStudent } from "@/lib/store/students";
import { getExam, getAttemptReview, getBatchRank } from "@/lib/store/exams";
import { listNotificationsForUser } from "@/lib/store/notifications";

export default async function StudentExamReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = getExam(id);
  if (!exam) notFound();

  const user = await getCurrentUser();
  const student = user ? getStudent(user.userId) : undefined;
  if (!student || student.batchId !== exam.batchId) notFound();

  const notifications = user ? listNotificationsForUser(user.userId) : [];

  if (!exam.publishedAt) {
    return (
      <DashboardLayout
        role="student"
        userName={student.name}
        pageTitle={exam.title}
        notifications={notifications}
      >
        <Card>
          <CardHeader>
            <CardTitle>Results not published yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Check back once your admin publishes results for this exam.
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const review = getAttemptReview(exam.id, student.id);
  if (!review) {
    return (
      <DashboardLayout
        role="student"
        userName={student.name}
        pageTitle={exam.title}
        notifications={notifications}
      >
        <Card>
          <CardHeader>
            <CardTitle>You didn&apos;t attempt this exam</CardTitle>
          </CardHeader>
        </Card>
      </DashboardLayout>
    );
  }

  const rank = getBatchRank(exam.id, student.id);

  return (
    <DashboardLayout
      role="student"
      userName={student.name}
      pageTitle={exam.title}
      notifications={notifications}
    >
      <Card>
        <CardHeader>
          <CardTitle>{exam.title} — Result</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-lg font-semibold">
              {review.attempt.score}/{exam.totalMarks}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Batch rank</p>
            <p className="text-lg font-semibold">{rank ? `#${rank}` : "—"}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Correct answers</p>
            <p className="text-lg font-semibold">
              {review.questions.filter((q) => q.isCorrect).length}/{review.questions.length}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Answer review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {review.questions.map((question, index) => (
            <div key={question.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">
                  {index + 1}. {question.text}
                </p>
                <Badge variant={question.isCorrect ? "secondary" : "destructive"} className="shrink-0">
                  {question.selectedOptionIndex === null
                    ? "Not answered"
                    : question.isCorrect
                      ? `+${question.earnedMarks}`
                      : question.earnedMarks}
                </Badge>
              </div>
              <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                {question.options.map((option, optionIndex) => {
                  const isCorrectOption = optionIndex === question.correctOptionIndex;
                  const isSelected = optionIndex === question.selectedOptionIndex;
                  return (
                    <p
                      key={optionIndex}
                      className={
                        isCorrectOption
                          ? "font-medium text-success"
                          : isSelected
                            ? "font-medium text-destructive"
                            : "text-muted-foreground"
                      }
                    >
                      {String.fromCharCode(65 + optionIndex)}. {option}
                      {isCorrectOption ? " ✓" : isSelected ? " ✗ (your answer)" : ""}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
