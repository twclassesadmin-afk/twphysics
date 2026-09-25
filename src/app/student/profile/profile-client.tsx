"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Student } from "@/lib/store/types";
import { saveStudentProfile } from "./actions";

export function StudentProfileClient({ student }: { student: Student }) {
  const [form, setForm] = useState({ phone: student.phone, address: student.address });
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveStudentProfile(form);
      if (result.ok) toast.success("Profile updated");
      else toast.error(result.error);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Editable details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone" placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address" placeholder="House no., street, city, PIN code"
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={pending}>
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-4" /> Locked details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enrolled course and batch are managed by TWPHYSICS admin. Contact support to make changes.
          </p>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Full name</p>
            <p className="text-sm font-medium">{student.name}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Parent/guardian</p>
            <p className="text-sm font-medium">
              {student.parentName || "—"} {student.parentPhone && `· ${student.parentPhone}`}
            </p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Enrolled course</p>
            <p className="text-sm font-medium">{student.courseName || "—"}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Batch</p>
            <p className="text-sm font-medium">{student.batchName}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
