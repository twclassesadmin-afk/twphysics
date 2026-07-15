"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SyllabusItem } from "@/lib/store/types";
import { advanceTopic } from "./actions";

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

export function TutorSyllabusClient({ items }: { items: SyllabusItem[] }) {
  const [pending, startTransition] = useTransition();

  function advance(id: string) {
    startTransition(async () => {
      const result = await advanceTopic(id);
      if (result.ok) toast.success("Syllabus status updated");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Syllabus for your batches</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No syllabus topics for your batches yet.
          </p>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="space-y-2 sm:hidden">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{item.topic}</span>
                    <Badge variant={STATUS_VARIANT[item.status]}>{STATUS_LABEL[item.status]}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.subject} · {item.batchName} · Due {item.deadline}
                  </p>
                  {item.status !== "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      disabled={pending}
                      onClick={() => advance(item.id)}
                    >
                      Mark {item.status === "not_started" ? "In Progress" : "Complete"}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.topic}</TableCell>
                      <TableCell className="text-muted-foreground">{item.subject}</TableCell>
                      <TableCell className="text-muted-foreground">{item.batchName}</TableCell>
                      <TableCell className="text-muted-foreground">{item.deadline}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[item.status]}>{STATUS_LABEL[item.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.status !== "completed" && (
                          <Button variant="outline" size="sm" disabled={pending} onClick={() => advance(item.id)}>
                            Mark {item.status === "not_started" ? "In Progress" : "Complete"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
