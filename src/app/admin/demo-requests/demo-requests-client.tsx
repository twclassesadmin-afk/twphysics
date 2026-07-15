"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DemoRequest } from "@/lib/store/types";
import { setDemoRequestStatus } from "./actions";

const STATUS_VARIANT: Record<DemoRequest["status"], "destructive" | "outline" | "secondary"> = {
  new: "destructive",
  contacted: "outline",
  closed: "secondary",
};

export function DemoRequestsClient({ requests }: { requests: DemoRequest[] }) {
  const [pending, startTransition] = useTransition();

  function update(id: string, status: DemoRequest["status"]) {
    startTransition(async () => {
      await setDemoRequestStatus(id, status);
      toast.success(status === "contacted" ? "Marked contacted" : "Request closed");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No demo requests yet.</p>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="space-y-2 sm:hidden">
              {requests.map((request) => (
                <div key={request.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{request.name}</span>
                    <Badge variant={STATUS_VARIANT[request.status]}>{request.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {request.phone} · {request.courseInterest} · {request.preferredTime}
                  </p>
                  {request.status === "new" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full"
                      disabled={pending}
                      onClick={() => update(request.id, "contacted")}
                    >
                      Mark Contacted
                    </Button>
                  )}
                  {request.status === "contacted" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2 w-full"
                      disabled={pending}
                      onClick={() => update(request.id, "closed")}
                    >
                      Close
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Preferred Time</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.name}
                        {request.email && (
                          <p className="text-xs font-normal text-muted-foreground">{request.email}</p>
                        )}
                      </TableCell>
                      <TableCell>{request.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{request.courseInterest}</TableCell>
                      <TableCell className="text-muted-foreground">{request.preferredTime}</TableCell>
                      <TableCell className="text-muted-foreground">{request.createdAt}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[request.status]}>{request.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === "new" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={() => update(request.id, "contacted")}
                          >
                            Mark Contacted
                          </Button>
                        )}
                        {request.status === "contacted" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={pending}
                            onClick={() => update(request.id, "closed")}
                          >
                            Close
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
