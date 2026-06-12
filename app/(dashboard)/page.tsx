"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Ship, FileText, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalVessels: number;
  totalReports: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<
    { id: string; name: string; status: string; vessel?: { name: string } }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const [projectsRes, vesselsRes, reportsRes] = await Promise.all([
        supabase.from("projects").select("id, name, status, vessel:vessels(name)"),
        supabase.from("vessels").select("id"),
        supabase.from("reports").select("id"),
      ]);

      const projects = projectsRes.data || [];
      setStats({
        totalProjects: projects.length,
        activeProjects: projects.filter(
          (p) => p.status === "IN_PROGRESS" || p.status === "TENDERING"
        ).length,
        totalVessels: vesselsRes.data?.length || 0,
        totalReports: reportsRes.data?.length || 0,
      });

      setRecentProjects(
        projects.slice(0, 5).map((p) => ({
          id: p.id,
          name: p.name,
          status: p.status,
          vessel: Array.isArray(p.vessel)
            ? (p.vessel[0] as { name: string } | undefined)
            : (p.vessel as { name: string } | undefined),
        }))
      );

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const statCards = [
    {
      title: "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      color: "text-ocean",
    },
    {
      title: "Active Projects",
      value: stats?.activeProjects ?? 0,
      icon: Clock,
      color: "text-amber-warn",
    },
    {
      title: "Vessels",
      value: stats?.totalVessels ?? 0,
      icon: Ship,
      color: "text-seagreen",
    },
    {
      title: "Reports",
      value: stats?.totalReports ?? 0,
      icon: FileText,
      color: "text-horizon",
    },
  ];

  const statusColor: Record<string, string> = {
    PLANNING: "bg-slate-100 text-slate-700",
    TENDERING: "bg-blue-100 text-blue-700",
    AWARDED: "bg-purple-100 text-purple-700",
    IN_PROGRESS: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-lg bg-hull flex items-center justify-center ${card.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-custom">{card.title}</p>
                      <p className="text-2xl font-bold text-navy">
                        {card.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-custom">
              <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No projects yet</p>
              <p className="text-xs mt-1">
                Create your first project to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-hull transition-colors"
                >
                  <div>
                    <p className="font-medium text-navy text-sm">
                      {project.name}
                    </p>
                    <p className="text-xs text-muted-custom">
                      {project.vessel?.name || "No vessel"}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={statusColor[project.status] || ""}
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}