"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resetTutorPassword } from "./actions";

export function ResetPasswordDialog({ tutorId, tutorEmail }: { tutorId: string; tutorEmail: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await resetTutorPassword(tutorId, password);
      if (result.ok) {
        toast.success("Password reset");
        setOpen(false);
        setPassword("");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <KeyRound /> Reset Password
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>{tutorEmail} will log in with this new password.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reset-password">New password</Label>
          <Input
            id="reset-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={submit} disabled={pending || password.trim().length < 6}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
