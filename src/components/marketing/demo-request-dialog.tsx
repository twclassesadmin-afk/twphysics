"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { submitDemoRequest } from "./demo-actions";

const COURSES = ["NEET", "IIT-Mains", "Not sure yet"];
const TIMES = ["Morning (7-10 AM)", "Evening (5-8 PM)", "Weekend"];

export function DemoRequestDialog({
  size = "lg",
  variant = "default",
  className,
  label = "Start Free Demo",
}: {
  size?: "sm" | "lg" | "default";
  variant?: "default" | "outline" | "link";
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    courseInterest: COURSES[0],
    preferredTime: TIMES[0],
  });
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await submitDemoRequest(form);
      if (result.ok) {
        toast.success("Demo requested!", {
          description: "Our team will call you within 24 hours to schedule your free class.",
        });
        setOpen(false);
        setForm({ name: "", phone: "", email: "", courseInterest: COURSES[0], preferredTime: TIMES[0] });
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size={size} variant={variant} className={className} />}>
        {label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book your free demo class</DialogTitle>
          <DialogDescription>
            No payment, no commitment — attend one full live class and decide for yourself.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-name">Full name</Label>
            <Input
              id="demo-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="demo-phone">Phone</Label>
              <Input
                id="demo-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-email">Email (optional)</Label>
              <Input
                id="demo-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Interested in</Label>
              <Select
                value={form.courseInterest}
                onValueChange={(value) => setForm({ ...form, courseInterest: value ?? COURSES[0] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COURSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preferred time</Label>
              <Select
                value={form.preferredTime}
                onValueChange={(value) => setForm({ ...form, preferredTime: value ?? TIMES[0] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={submit} disabled={pending || !form.name.trim() || !form.phone.trim()}>
            Request Demo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
