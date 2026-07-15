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
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { FreeResource, ResultEntry, Testimonial } from "@/lib/store/types";
import {
  createFreeResource,
  deleteFreeResource,
  createResult,
  deleteResult,
  createTestimonial,
  deleteTestimonial,
} from "./actions";

export function AdminMarketingClient({
  freeResources,
  results,
  testimonials,
}: {
  freeResources: FreeResource[];
  results: ResultEntry[];
  testimonials: Testimonial[];
}) {
  return (
    <Tabs defaultValue="resources">
      <TabsList>
        <TabsTrigger value="resources">Free Resources</TabsTrigger>
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
      </TabsList>

      <TabsContent value="resources" className="mt-4">
        <FreeResourcesTab freeResources={freeResources} />
      </TabsContent>
      <TabsContent value="results" className="mt-4">
        <ResultsTab results={results} />
      </TabsContent>
      <TabsContent value="testimonials" className="mt-4">
        <TestimonialsTab testimonials={testimonials} />
      </TabsContent>
    </Tabs>
  );
}

function FreeResourcesTab({ freeResources }: { freeResources: FreeResource[] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{ title: string; description: string; type: FreeResource["type"]; url: string }>({
    title: "",
    description: "",
    type: "pdf",
    url: "",
  });
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await createFreeResource(draft);
      if (result.ok) {
        toast.success("Resource added to homepage");
        setDraft({ title: "", description: "", type: "pdf", url: "" });
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteFreeResource(id);
      if (result.ok) toast("Resource removed");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:space-y-0">
        <CardTitle>Free Resources (homepage)</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus /> Add Resource
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add free resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resource-title">Title</Label>
                <Input
                  id="resource-title"
                  placeholder="Free Mock Test"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resource-description">Description</Label>
                <Textarea
                  id="resource-description"
                  rows={2}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={draft.type}
                  onValueChange={(value) => setDraft({ ...draft, type: (value as FreeResource["type"]) ?? "pdf" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">NCERT / PDF Notes</SelectItem>
                    <SelectItem value="test">Mock Test</SelectItem>
                    <SelectItem value="demo">Free Demo (uses the Book a Demo form)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {draft.type !== "demo" && (
                <div className="space-y-2">
                  <Label htmlFor="resource-url">{draft.type === "pdf" ? "PDF URL" : "Test URL"}</Label>
                  <Input
                    id="resource-url"
                    placeholder="https://..."
                    value={draft.url}
                    onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button onClick={submit} disabled={pending || !draft.title.trim()}>
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {freeResources.length === 0 ? (
          <p className="text-sm text-muted-foreground">No free resources yet.</p>
        ) : (
          freeResources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>
                <p className="font-medium">{resource.title}</p>
                <p className="text-xs text-muted-foreground">{resource.description}</p>
              </div>
              <Button variant="ghost" size="sm" disabled={pending} onClick={() => remove(resource.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
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
                  <Input id="result-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
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
                  id="result-quote"
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
                <Input id="testimonial-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
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
                  id="testimonial-quote"
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
