"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download } from "lucide-react";
import type { Report } from "@/types/database";

interface ReportWithProject extends Report {
  projects?: { name: string } | null;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchReports = async () => {
      const { data } = await supabase
        .from("reports")
        .select("*, projects(name)")
        .order("created_at", { ascending: false });

      const mapped = (data || []).map((r) => ({
        ...r,
        projects: Array.isArray(r.projects) ? r.projects[0] : r.projects,
      })) as ReportWithProject[];

      setReports(mapped);
      setLoading(false);
    };
    fetchReports();
  }, []);

  const statusColor: Record<string, string> = {
    PENDING: "bg-slate-100 text-slate-700",
    GENERATING: "bg-blue-100 text-blue-700",
    READY: "bg-emerald-100 text-emerald-700",
    FAILED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Reports</h2>
        <p className="text-sm text-muted-custom">Manage all drydock reports</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-muted-custom">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No reports yet</p>
          <p className="text-sm mt-1">No reports generated yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-custom" />
                  <div>
                    <p className="font-medium text-navy text-sm">
                      {report.report_type.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-custom">
                      {report.projects?.name || "Unknown project"} &middot;{" "}
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={statusColor[report.status]}>
                    {report.status}
                  </Badge>
                  {report.status === "READY" && report.file_url && (
                    <a
                      href={report.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 text-ocean" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}