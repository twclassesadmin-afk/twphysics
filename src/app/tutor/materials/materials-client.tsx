"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, FileText, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Batch, StudyMaterial } from "@/lib/store/types";
import { uploadMaterial, deleteMaterial } from "./actions";

export function TutorMaterialsClient({
  materials,
  batches,
}: {
  materials: StudyMaterial[];
  batches: Batch[];
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{ title: string; type: "pdf" | "link"; url: string; batchId: string }>({
    title: "",
    type: "pdf",
    url: "",
    batchId: batches[0]?.id ?? "",
  });
  const [pending, startTransition] = useTransition();

  function upload() {
    startTransition(async () => {
      const result = await uploadMaterial(draft);
      if (result.ok) {
        toast.success("Material uploaded — batch notified");
        setDraft({ title: "", type: "pdf", url: "", batchId: batches[0]?.id ?? "" });
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteMaterial(id);
      if (result.ok) toast("Material removed");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:space-y-0">
        <CardTitle>Study material for your batches</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus /> Upload Material
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload study material</DialogTitle>
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
                <Label htmlFor="material-title">Title</Label>
                <Input
                  id="material-title"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={draft.type}
                  onValueChange={(value) => setDraft({ ...draft, type: (value as "pdf" | "link") ?? "pdf" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF / Notes</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-url">{draft.type === "pdf" ? "PDF URL" : "Link URL"}</Label>
                <Input
                  id="material-url"
                  placeholder="https://..."
                  value={draft.url}
                  onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Paste a hosted link for now — direct PDF upload lands once Supabase storage is wired.
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button onClick={upload} disabled={pending || !draft.title.trim() || !draft.url.trim()}>
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">No materials uploaded yet.</p>
        ) : (
          materials.map((material) => {
            const Icon = material.type === "link" ? LinkIcon : FileText;
            return (
              <div
                key={material.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <a
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:underline"
                >
                  <Icon className="size-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{material.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {material.batchName} · Uploaded {material.uploadedAt}
                    </p>
                  </div>
                </a>
                <Button variant="ghost" size="sm" disabled={pending} onClick={() => remove(material.id)}>
                  Remove
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
