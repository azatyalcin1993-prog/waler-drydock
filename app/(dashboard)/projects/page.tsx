"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FolderKanban, Ship, Calendar } from "lucide-react";
import type { Project, Vessel } from "@/types/database";

const statusColor: Record<string, string> = {
  PLANNING: "bg-slate-100 text-slate-700",
  TENDERING: "bg-blue-100 text-blue-700",
  AWARDED: "bg-purple-100 text-purple-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

interface ProjectWithVessel extends Project {
  vessel?: Vessel;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithVessel[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*, vessel:vessels(*)")
        .order("created_at", { ascending: false });

      const mapped = (data || []).map((p) => ({
        ...p,
        vessel: Array.isArray(p.vessel) ? p.vessel[0] : p.vessel,
      })) as ProjectWithVessel[];

      setProjects(mapped);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Projects</h2>
          <p className="text-sm text-muted-custom">
            Manage drydock projects
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-muted-custom">
          <FolderKanban className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No projects yet</p>
          <p className="text-sm mt-1">Create your first drydock project</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-navy">{project.name}</h3>
                    <Badge
                      variant="secondary"
                      className={statusColor[project.status]}
                    >
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-custom">
                    <div className="flex items-center gap-2">
                      <Ship className="h-4 w-4" />
                      <span>{project.vessel?.name || "No vessel"}</span>
                    </div>
                    {(project.planned_start || project.planned_end) && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {project.planned_start || "—"} to{" "}
                          {project.planned_end || "—"}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}