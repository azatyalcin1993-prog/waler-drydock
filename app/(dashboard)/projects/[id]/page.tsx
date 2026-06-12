"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Ship,
  Calendar,
  ClipboardList,
  FileText,
  TrendingUp,
  AlertTriangle,
  Sun,
} from "lucide-react";
import type { Project, WorkOrder, Tender, Report, Vessel } from "@/types/database";

const statusColor: Record<string, string> = {
  PLANNING: "bg-slate-100 text-slate-700",
  TENDERING: "bg-blue-100 text-blue-700",
  AWARDED: "bg-purple-100 text-purple-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const woStatusColor: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  ON_HOLD: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const priorityColor: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  NORMAL: "bg-blue-100 text-blue-600",
  HIGH: "bg-amber-100 text-amber-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const supabase = createClient();

  const [project, setProject] = useState<(Project & { vessel?: Vessel }) | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [woDialogOpen, setWoDialogOpen] = useState(false);
  const [woForm, setWoForm] = useState({
    title: "",
    sfi_code: "",
    description: "",
    category: "",
    priority: "NORMAL",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [projectRes, woRes, tenderRes, reportRes] = await Promise.all([
      supabase.from("projects").select("*, vessel:vessels(*)").eq("id", projectId).single(),
      supabase.from("work_orders").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase.from("tenders").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase.from("reports").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
    ]);

    if (projectRes.data) {
      const p = projectRes.data;
      setProject({
        ...p,
        vessel: Array.isArray(p.vessel) ? p.vessel[0] : p.vessel,
      });
    }
    setWorkOrders((woRes.data as WorkOrder[]) || []);
    setTenders((tenderRes.data as Tender[]) || []);
    setReports((reportRes.data as Report[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleCreateWorkOrder = async () => {
    setSaving(true);
    const { error } = await supabase.from("work_orders").insert({
      project_id: projectId,
      title: woForm.title,
      sfi_code: woForm.sfi_code || null,
      description: woForm.description || null,
      category: woForm.category || null,
      priority: woForm.priority,
      status: "PENDING",
    });
    setSaving(false);
    if (!error) {
      setWoDialogOpen(false);
      setWoForm({ title: "", sfi_code: "", description: "", category: "", priority: "NORMAL" });
      fetchData();
    }
  };

  const handleGenerateReport = async (reportType: string) => {
    await supabase.from("reports").insert({
      project_id: projectId,
      report_type: reportType,
      status: "PENDING",
    });
    fetchData();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16 text-muted-custom">Project not found</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push("/projects")}
            className="flex items-center gap-1 text-sm text-muted-custom hover:text-navy mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </button>
          <h2 className="text-xl font-bold text-navy">{project.name}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-custom">
            <div className="flex items-center gap-1">
              <Ship className="h-4 w-4" />
              {project.vessel?.name || "No vessel"}
            </div>
            {(project.planned_start || project.planned_end) && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {project.planned_start || "—"} to {project.planned_end || "—"}
              </div>
            )}
          </div>
        </div>
        <Badge variant="secondary" className={statusColor[project.status]}>
          {project.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-navy">{workOrders.length}</p>
            <p className="text-xs text-muted-custom">Work Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-navy">{tenders.length}</p>
            <p className="text-xs text-muted-custom">Tenders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-navy">{reports.length}</p>
            <p className="text-xs text-muted-custom">Reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-ocean">
              {workOrders.length > 0
                ? Math.round(
                    workOrders.reduce((sum, wo) => sum + (wo.updates?.[0]?.progress ?? 0), 0) /
                      workOrders.length
                  )
                : 0}
              %
            </p>
            <p className="text-xs text-muted-custom">Avg Progress</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="work-orders">
        <TabsList className="flex-wrap">
          <TabsTrigger value="work-orders">
            <ClipboardList className="h-4 w-4 mr-1" />
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="defects">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Defects
          </TabsTrigger>
          <TabsTrigger value="daily-reports">
            <Sun className="h-4 w-4 mr-1" />
            Daily Reports
          </TabsTrigger>
          <TabsTrigger value="tenders">
            <FileText className="h-4 w-4 mr-1" />
            Tenders
          </TabsTrigger>
          <TabsTrigger value="reports">
            <TrendingUp className="h-4 w-4 mr-1" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="work-orders" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setWoDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Work Order
            </Button>
          </div>

          {workOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-custom">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No work orders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {workOrders.map((wo) => (
                <Card key={wo.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {wo.sfi_code && (
                          <span className="text-xs font-mono bg-hull px-1.5 py-0.5 rounded">
                            {wo.sfi_code}
                          </span>
                        )}
                        <span className="font-medium text-navy text-sm">{wo.title}</span>
                      </div>
                      {wo.description && (
                        <p className="text-xs text-muted-custom mt-1 line-clamp-1">
                          {wo.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={priorityColor[wo.priority]}>
                        {wo.priority}
                      </Badge>
                      <Badge variant="secondary" className={woStatusColor[wo.status]}>
                        {wo.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={woDialogOpen} onOpenChange={setWoDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Work Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={woForm.title}
                    onChange={(e) => setWoForm({ ...woForm, title: e.target.value })}
                    placeholder="Work order title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SFI Code</Label>
                    <Input
                      value={woForm.sfi_code}
                      onChange={(e) => setWoForm({ ...woForm, sfi_code: e.target.value })}
                      placeholder="e.g. 312.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={woForm.priority}
                      onValueChange={(val) => setWoForm({ ...woForm, priority: val ?? "NORMAL" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={woForm.description}
                    onChange={(e) => setWoForm({ ...woForm, description: e.target.value })}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCreateWorkOrder}
                  disabled={!woForm.title || saving}
                  className="w-full"
                >
                  {saving ? "Creating..." : "Create Work Order"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="defects" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => router.push(`/projects/${projectId}/defects`)}>
              <AlertTriangle className="h-4 w-4 mr-1" />
              View All Defects
            </Button>
          </div>
          <div className="text-center py-12 text-muted-custom">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Defect tracking module</p>
            <p className="text-xs mt-1">
              View and manage all discovered defects with before/after photos
            </p>
          </div>
        </TabsContent>

        <TabsContent value="daily-reports" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => router.push(`/projects/${projectId}/daily-reports`)}>
              <Sun className="h-4 w-4 mr-1" />
              View All Daily Reports
            </Button>
          </div>
          <div className="text-center py-12 text-muted-custom">
            <Sun className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Daily progress reports</p>
            <p className="text-xs mt-1">
              Track daily progress, manpower, weather, and safety incidents
            </p>
          </div>
        </TabsContent>

        <TabsContent value="tenders" className="space-y-4">
          {tenders.length === 0 ? (
            <div className="text-center py-12 text-muted-custom">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No tenders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tenders.map((tender) => (
                <Card key={tender.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-navy text-sm">{tender.yard_name}</span>
                      {tender.yard_country && (
                        <span className="text-xs text-muted-custom ml-2">{tender.yard_country}</span>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        tender.status === "AWARDED"
                          ? "bg-emerald-100 text-emerald-700"
                          : tender.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                      }
                    >
                      {tender.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => handleGenerateReport("PROGRESS_REPORT")}>
              Progress Report
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleGenerateReport("DAILY_REPORT")}>
              Daily Report
            </Button>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12 text-muted-custom">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No reports yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-navy text-sm">
                        {report.report_type.replace("_", " ")}
                      </span>
                      <p className="text-xs text-muted-custom mt-0.5">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        report.status === "READY"
                          ? "bg-emerald-100 text-emerald-700"
                          : report.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                      }
                    >
                      {report.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}