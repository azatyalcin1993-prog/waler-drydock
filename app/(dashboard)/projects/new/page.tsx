"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Vessel } from "@/types/database";

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    vessel_id: "",
    planned_start: "",
    planned_end: "",
  });

  useEffect(() => {
    const fetchVessels = async () => {
      const { data } = await supabase
        .from("vessels")
        .select("*")
        .order("name");
      setVessels((data as Vessel[]) || []);
    };
    fetchVessels();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      setSaving(false);
      return;
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        name: form.name,
        vessel_id: form.vessel_id,
        organization_id: profile.organization_id,
        planned_start: form.planned_start || null,
        planned_end: form.planned_end || null,
        status: "PLANNING",
      })
      .select("id")
      .single();

    setSaving(false);

    if (project && !error) {
      router.push(`/projects/${project.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-navy">New Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. 2026 Drydock - MV Pacific Star"
            />
          </div>

          <div className="space-y-2">
            <Label>Vessel</Label>
            <Select
              value={form.vessel_id}
              onValueChange={(val) => setForm({ ...form, vessel_id: val ?? "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a vessel" />
              </SelectTrigger>
              <SelectContent>
                {vessels.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                    {v.imo_number ? ` (IMO ${v.imo_number})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Planned Start</Label>
              <Input
                type="date"
                value={form.planned_start}
                onChange={(e) =>
                  setForm({ ...form, planned_start: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Planned End</Label>
              <Input
                type="date"
                value={form.planned_end}
                onChange={(e) =>
                  setForm({ ...form, planned_end: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.name || !form.vessel_id || saving}
              className="flex-1"
            >
              {saving ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}