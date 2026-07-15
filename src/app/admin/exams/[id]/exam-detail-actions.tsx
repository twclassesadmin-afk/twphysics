"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { publishExamResults, deleteExamResults } from "../actions";

export function ExamDetailActions({
  examId,
  batchId,
  title,
  isPublished,
}: {
  examId: string;
  batchId: string;
  title: string;
  isPublished: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function publish() {
    startTransition(async () => {
      const result = await publishExamResults(examId, batchId, title);
      if (result.ok) {
        toast.success("Results published — students and tutors notified");
      } else {
        toast.error(result.error);
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteExamResults(examId);
      if (result.ok) {
        toast.success("Result data deleted");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex gap-2">
      {!isPublished && (
        <Button size="sm" onClick={publish} disabled={pending}>
          <Send /> Publish Results
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger render={<Button size="sm" variant="outline" disabled={pending} />}>
          <Trash2 /> Delete Results
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all attempts for this exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears every student&apos;s answers and score for &ldquo;{title}&rdquo;. The exam and its
              questions stay intact — this can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
