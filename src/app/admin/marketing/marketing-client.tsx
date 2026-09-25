"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ResultEntry, Testimonial } from "@/lib/store/types";
import { createResult, deleteResult, createTestimonial, deleteTestimonial } from "./actions";

export function AdminMarketingClient({
  results,
  testimonials,
}: {
  results: ResultEntry[];
  testimonials: Testimonial[];
}) {
  return (
    <Tabs defaultValue="results">
      <TabsList>
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
      </TabsList>

      <TabsContent value="results" className="mt-4">
        <ResultsTab results={results} />
      </TabsContent>
      <TabsContent value="testimonials" className="mt-4">
        <TestimonialsTab testimonials={testimonials} />
      </TabsContent>
    </Tabs>
  );
}

function ResultsTab({ results }: { results: ResultEntry[] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", exam: "", rank: "", score: "", quote: "" });
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await createResult(draft);
      if (result.ok) {
        toast.success("Result added to homepage");
        setDraft({ name: "", exam: "", rank: "", score: "", quote: "" });
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteResult(id);
      if (result.ok) toast("Result removed");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:space-y-0">
        <CardTitle>Results Wall (homepage)</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus /> Add Result
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a result</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="result-name">Student name</Label>
                  <Input id="result-name" placeholder="e.g. Priya Reddy" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="result-exam">Exam</Label>
                  <Input
                    id="result-exam"
                    placeholder="NEET 2026"
                    value={draft.exam}
                    onChange={(e) => setDraft({ ...draft, exam: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="result-rank">Rank</Label>
                  <Input
                    id="result-rank"
                    placeholder="AIR 342"
                    value={draft.rank}
                    onChange={(e) => setDraft({ ...draft, rank: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="result-score">Score</Label>
                  <Input
                    id="result-score"
                    placeholder="685/720"
                    value={draft.score}
                    onChange={(e) => setDraft({ ...draft, score: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="result-quote">Quote</Label>
                <Textarea
                  id="result-quote" placeholder="What the student said about their preparation..."
                  rows={2}
                  value={draft.quote}
                  onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button onClick={submit} disabled={pending || !draft.name.trim() || !draft.exam.trim()}>
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No results yet.</p>
        ) : (
          results.map((result) => (
            <div key={result.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">
                  {result.name} · {result.rank}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.exam} · {result.score}
                </p>
              </div>
              <Button variant="ghost" size="sm" disabled={pending} onClick={() => remove(result.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function TestimonialsTab({ testimonials }: { testimonials: Testimonial[] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", role: "", quote: "" });
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await createTestimonial(draft);
      if (result.ok) {
        toast.success("Testimonial added to homepage");
        setDraft({ name: "", role: "", quote: "" });
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteTestimonial(id);
      if (result.ok) toast("Testimonial removed");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:space-y-0">
        <CardTitle>Testimonials (homepage)</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus /> Add Testimonial
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testimonial-name">Name</Label>
                <Input id="testimonial-name" placeholder="e.g. Srinivas Rao" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testimonial-role">Role</Label>
                <Input
                  id="testimonial-role"
                  placeholder="NEET 2026, AIR 342 (or 'Parent of a Class 12 student')"
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testimonial-quote">Quote</Label>
                <Textarea
                  id="testimonial-quote" placeholder="What they said about TWPHYSICS..."
                  rows={3}
                  value={draft.quote}
                  onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button onClick={submit} disabled={pending || !draft.name.trim() || !draft.quote.trim()}>
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {testimonials.length === 0 ? (
          <p className="text-sm text-muted-foreground">No testimonials yet.</p>
        ) : (
          testimonials.map((testimonial) => (
            <div key={testimonial.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                <p className="mt-1 italic text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
              </div>
              <Button variant="ghost" size="sm" disabled={pending} onClick={() => remove(testimonial.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
