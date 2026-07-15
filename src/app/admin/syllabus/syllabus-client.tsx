"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Batch, SyllabusItem } from "@/lib/store/types";
import { createSyllabusTopic } from "./actions";

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

export function AdminSyllabusClient({ items, batches }: { items: SyllabusItem[]; batches: Batch[] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ topic: "", subject: "", deadline: "", batchId: batches[0]?.id ?? "" });
  const [pending, startTransition] = useTransition();

  function addTopic() {
    startTransition(async () => {
      const result = await createSyllabusTopic(draft);
      if (result.ok) {
        toast.success("Syllabus topic added — batch tutor notified");
        setDraft({ topic: "", subject: "", deadline: "", batchId: batches[0]?.id ?? "" });
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:space-y-0">
        <CardTitle>Syllabus — all batches</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus /> Add Topic
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add syllabus topic</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Batch</Label>
                <Select
                  value={draft.batchId}
                  onValueChange={(value) => setDraft({ ...draft, batchId: value ?? "" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={draft.topic}
                  onChange={(e) => setDraft({ ...draft, topic: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={draft.subject}
                  onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={draft.deadline}
                  onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button
                onClick={addTopic}
                disabled={pending || !draft.topic.trim() || !draft.subject.trim() || !draft.deadline}
              >
                Add Topic
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
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
            </div>
          ))}
        </div>

        <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
