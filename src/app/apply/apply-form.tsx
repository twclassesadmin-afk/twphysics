"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitTutorApplication } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const SUBJECTS = ["Physics", "Maths", "Chemistry"];

export function ApplyForm() {
  const [state, formAction, pending] = useActionState(submitTutorApplication, null);
  const [subjects, setSubjects] = useState<string[]>([]);

  function toggleSubject(subject: string) {
    setSubjects((prev) => (prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]));
  }

  if (state && "success" in state) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application received</CardTitle>
          <CardDescription>
            Thanks for applying — our admin team will review your details and reach out if it&apos;s a fit.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/" className="text-sm underline underline-offset-4">
            &larr; Back to home
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply to teach</CardTitle>
        <CardDescription>Tell us about yourself — our admin team reviews every application.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        {subjects.map((subject) => (
          <input key={subject} type="hidden" name="subjects" value={subject} />
        ))}

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" autoComplete="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          <div className="space-y-2">
            <Label>Subjects you can teach</Label>
            <div className="flex flex-wrap gap-3 pt-1">
              {SUBJECTS.map((subject) => (
                <label key={subject} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={subjects.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="size-4 rounded border-input"
                  />
                  {subject}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualifications">Qualifications</Label>
            <Input id="qualifications" name="qualifications" placeholder="e.g. M.Sc Physics, B.Tech" required />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="experience">Teaching experience</Label>
              <Input id="experience" name="experience" placeholder="e.g. 3 years" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Input id="availability" name="availability" placeholder="e.g. Weekday evenings" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About you</Label>
            <Textarea id="bio" name="bio" rows={4} placeholder="Tell us about your teaching style and background" required />
          </div>

          {state && "error" in state && <p className="text-sm text-destructive">{state.error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending || subjects.length === 0}>
            {pending ? "Submitting..." : "Submit application"}
          </Button>
          <Link href="/" className="text-sm text-muted-foreground underline underline-offset-4">
            &larr; Back to home
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
