"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Ship, Pencil, Trash2 } from "lucide-react";
import type { Vessel } from "@/types/database";

export default function VesselsPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [form, setForm] = useState({
    name: "",
    imo_number: "",
    flag: "",
    vessel_type: "",
  });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const fetchVessels = async () => {
    const { data } = await supabase
      .from("vessels")
      .select("*")
      .order("created_at", { ascending: false });
    setVessels((data as Vessel[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  const openCreate = () => {
    setEditingVessel(null);
    setForm({ name: "", imo_number: "", flag: "", vessel_type: "" });
    setDialogOpen(true);
  };

  const openEdit = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setForm({
      name: vessel.name,
      imo_number: vessel.imo_number || "",
      flag: vessel.flag || "",
      vessel_type: vessel.vessel_type || "",
    });
    setDialogOpen(true);
  };

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

    const payload = {
      name: form.name,
      imo_number: form.imo_number || null,
      flag: form.flag || null,
      vessel_type: form.vessel_type || null,
      organization_id: profile.organization_id,
    };

    if (editingVessel) {
      await supabase.from("vessels").update(payload).eq("id", editingVessel.id);
    } else {
      await supabase.from("vessels").insert(payload);
    }

    setDialogOpen(false);
    setSaving(false);
    fetchVessels();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vessel?")) return;
    await supabase.from("vessels").delete().eq("id", id);
    fetchVessels();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Vessels</h2>
          <p className="text-sm text-muted-custom">Manage your fleet</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vessel
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingVessel ? "Edit Vessel" : "New Vessel"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Vessel Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. MV Pacific Star"
                />
              </div>
              <div className="space-y-2">
                <Label>IMO Number</Label>
                <Input
                  value={form.imo_number}
                  onChange={(e) =>
                    setForm({ ...form, imo_number: e.target.value })
                  }
                  placeholder="e.g. 9876543"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Flag</Label>
                  <Input
                    value={form.flag}
                    onChange={(e) =>
                      setForm({ ...form, flag: e.target.value })
                    }
                    placeholder="e.g. Panama"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input
                    value={form.vessel_type}
                    onChange={(e) =>
                      setForm({ ...form, vessel_type: e.target.value })
                    }
                    placeholder="e.g. Bulk Carrier"
                  />
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={!form.name || saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Vessel"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : vessels.length === 0 ? (
        <div className="text-center py-16 text-muted-custom">
          <Ship className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No vessels yet</p>
          <p className="text-sm mt-1">Add your first vessel to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vessels.map((vessel) => (
            <Card key={vessel.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-navy">{vessel.name}</h3>
                    {vessel.imo_number && (
                      <p className="text-xs font-mono text-muted-custom mt-1">
                        IMO {vessel.imo_number}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {vessel.flag && (
                        <span className="text-xs bg-hull px-2 py-0.5 rounded">
                          {vessel.flag}
                        </span>
                      )}
                      {vessel.vessel_type && (
                        <span className="text-xs bg-hull px-2 py-0.5 rounded">
                          {vessel.vessel_type}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(vessel)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rust"
                      onClick={() => handleDelete(vessel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}