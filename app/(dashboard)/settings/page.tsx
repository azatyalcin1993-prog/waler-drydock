"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Shield } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  role: string;
  organization_id: string | null;
  organizations?: { name: string } | null;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*, organizations(name)")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          ...data,
          organizations: Array.isArray(data.organizations)
            ? data.organizations[0]
            : data.organizations,
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [supabase]);

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold text-navy">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-navy flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={profile?.full_name || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div>
              <Badge variant="secondary" className="bg-ocean text-white">
                {profile?.role || "VIEWER"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-navy flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Organization</Label>
            <Input
              value={(profile?.organizations as { name: string } | null)?.name || "Not assigned"}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-navy flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-custom space-y-2">
            <p><strong className="text-navy">ADMIN:</strong> Full access including user management</p>
            <p><strong className="text-navy">MANAGER:</strong> Project, tender, and report management</p>
            <p><strong className="text-navy">INSPECTOR:</strong> Work order updates and photo uploads</p>
            <p><strong className="text-navy">VIEWER:</strong> Read-only access</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}