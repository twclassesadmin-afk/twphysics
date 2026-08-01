import { FileText, Link as LinkIcon } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/get-current-user";
import { listAllMaterials } from "@/lib/store/materials";
import { listNotificationsForUser } from "@/lib/store/notifications";

export default async function AdminMaterialsPage() {
  const user = await getCurrentUser();
  const materials = await listAllMaterials();
  const notifications = user ? await listNotificationsForUser(user.userId) : [];

  return (
    <DashboardLayout
      role="admin"
      userName={user?.fullName ?? "Admin User"}
      pageTitle="Study Material"
      notifications={notifications}
    >
      <Card>
        <CardHeader>
          <CardTitle>All materials uploaded by tutors</CardTitle>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No materials uploaded yet.</p>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="space-y-2 sm:hidden">
                {materials.map((material) => {
                  const Icon = material.type === "link" ? LinkIcon : FileText;
                  return (
                    <a
                      key={material.id}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border p-3 text-sm"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <Icon className="size-4 shrink-0 text-primary" /> {material.title}
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {material.batchName} · {material.uploadedBy} · {material.uploadedAt}
                      </p>
                    </a>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => {
                      const Icon = material.type === "link" ? LinkIcon : FileText;
                      return (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">
                            <span className="flex items-center gap-2">
                              <Icon className="size-4 text-primary" /> {material.title}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{material.batchName}</TableCell>
                          <TableCell className="text-muted-foreground">{material.uploadedBy}</TableCell>
                          <TableCell className="text-muted-foreground">{material.uploadedAt}</TableCell>
                          <TableCell className="text-right">
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary underline-offset-4 hover:underline"
                            >
                              View
                            </a>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
