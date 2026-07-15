"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import type { Tutor } from "@/lib/store/types";
import { saveTutorProfile, requestLockedFieldChange } from "./actions";

export function TutorProfileClient({ tutor }: { tutor: Tutor }) {
  const [form, setForm] = useState({
    phone: tutor.phone,
    availability: tutor.availability,
    bio: tutor.bio,
  });
  const [requestField, setRequestField] = useState<string | null>(null);
  const [requestNote, setRequestNote] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveTutorProfile(form);
      if (result.ok) toast.success("Profile updated");
      else toast.error(result.error);
    });
  }

  function submitChangeRequest() {
    if (!requestField) return;
    startTransition(async () => {
      const result = await requestLockedFieldChange(requestField, requestNote);
      if (result.ok) {
        toast.success("Change request sent to admin", {
          description: `Admin will review your request to update "${requestField}".`,
        });
        setRequestField(null);
        setRequestNote("");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={requestField !== null} onOpenChange={(open) => !open && setRequestField(null)}>
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
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
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
              These fields are admin-verified and can only be changed via an admin-approved request.
            </p>
            {(
              [
                { key: "Full name", value: tutor.fullName },
                { key: "Subjects", value: tutor.subjects },
                { key: "Qualifications", value: tutor.qualifications },
              ]
            ).map((field) => (
              <div key={field.key} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-xs text-muted-foreground">{field.key}</p>
                  <p className="text-sm font-medium">{field.value}</p>
                </div>
                <DialogTrigger
                  render={<Button variant="outline" size="sm" />}
                  onClick={() => setRequestField(field.key)}
                >
                  Request change
                </DialogTrigger>
              </div>
            ))}
            <Badge variant="secondary">Admin-only edit</Badge>
          </CardContent>
        </Card>
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a change</DialogTitle>
          <DialogDescription>
            This notifies the admin team to review and approve the change to &ldquo;{requestField}&rdquo;.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="request-note">What should it be changed to?</Label>
          <Textarea
            id="request-note"
            rows={3}
            value={requestNote}
            onChange={(e) => setRequestNote(e.target.value)}
            placeholder="Describe the correction needed..."
          />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={submitChangeRequest} disabled={pending || !requestNote.trim()}>
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
