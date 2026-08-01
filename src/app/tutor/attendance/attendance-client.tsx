"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveAttendance } from "./actions";

type RosterStudent = { id: string; name: string };
type BatchOption = { id: string; name: string; subjects: string[]; roster: RosterStudent[] };
type Mark = { studentId: string; date: string; subject: string; attended: boolean };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TutorAttendanceClient({ batches, marks }: { batches: BatchOption[]; marks: Mark[] }) {
  const [batchId, setBatchId] = useState(batches[0]?.id ?? "");
  const batch = batches.find((b) => b.id === batchId);
  const [subject, setSubject] = useState(batch?.subjects[0] ?? "");
  const [date, setDate] = useState(today());
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();

  const existingForSelection = useMemo(() => {
    const rosterIds = new Set((batch?.roster ?? []).map((s) => s.id));
    const map = new Map<string, boolean>();
    for (const m of marks) {
      if (m.date === date && m.subject === subject && rosterIds.has(m.studentId)) {
        map.set(m.studentId, m.attended);
      }
    }
    return map;
  }, [marks, date, subject, batch]);

  function pickBatch(id: string) {
    const next = batches.find((b) => b.id === id);
    setBatchId(id);
    setSubject(next?.subjects[0] ?? "");
    setDraft({});
  }

  function pickSubject(value: string) {
    setSubject(value);
    setDraft({});
  }

  function pickDate(value: string) {
    setDate(value);
    setDraft({});
  }

  function markedValue(studentId: string): boolean {
    if (studentId in draft) return draft[studentId];
    return existingForSelection.get(studentId) ?? false;
  }

  function save() {
    if (!batch || !subject) return;
    const entries = batch.roster.map((s) => ({ studentId: s.id, attended: markedValue(s.id) }));
    startTransition(async () => {
      const result = await saveAttendance(batch.id, subject, date, entries);
      if (result.ok) {
        toast.success("Attendance saved");
        setDraft({});
      } else {
        toast.error(result.error);
      }
    });
  }

  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          You&apos;re not assigned to teach any subject yet — ask admin to assign you to a batch.
        </CardContent>
      </Card>
    );
  }

  const markedCount = batch?.roster.filter((s) => existingForSelection.has(s.id) || s.id in draft).length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark attendance</CardTitle>
        <CardDescription>Students you don&apos;t mark Present stay Absent by default.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Batch</Label>
            <Select
              items={batches.map((b) => ({ value: b.id, label: b.name }))}
              value={batchId}
              onValueChange={(value) => value && pickBatch(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select
              items={(batch?.subjects ?? []).map((s) => ({ value: s, label: s }))}
              value={subject}
              onValueChange={(value) => pickSubject(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(batch?.subjects ?? []).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="attendance-date">Date</Label>
            <Input
              id="attendance-date"
              type="date"
              max={today()}
              value={date}
              onChange={(e) => pickDate(e.target.value)}
            />
          </div>
        </div>

        {batch && batch.roster.length > 0 ? (
          <>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{batch.roster.length} students</span>
              <span>
                {markedCount}/{batch.roster.length} marked for this date
              </span>
            </div>
            <div className="space-y-1.5">
              {batch.roster.map((s) => {
                const present = markedValue(s.id);
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-2">
                    <span className="text-sm font-medium">{s.name}</span>
                    <div className="flex gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant={present ? "default" : "outline"}
                        onClick={() => setDraft((d) => ({ ...d, [s.id]: true }))}
                      >
                        Present
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!present ? "destructive" : "outline"}
                        onClick={() => setDraft((d) => ({ ...d, [s.id]: false }))}
                      >
                        Absent
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button onClick={save} disabled={pending} className="w-full">
              {pending ? "Saving..." : "Save attendance"}
            </Button>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">No students in this batch yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
