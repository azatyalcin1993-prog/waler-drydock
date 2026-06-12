"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Anchor } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    window.location.href = "/";
  };

  return (
    <div className="w-full max-w-md bg-deck rounded-xl shadow-2xl border border-border p-8">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Anchor className="h-8 w-8 text-ocean" />
        <h1 className="text-2xl font-bold text-navy">Waler Drydock</h1>
      </div>
      <p className="text-muted-custom text-sm text-center mb-8">
        Sign in to your account
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-center font-medium text-rust bg-red-50 p-2.5 rounded border border-red-200">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-custom mt-6">
        Don't have an account?{" "}
        <a href="/register" className="text-ocean hover:underline font-medium">
          Contact admin
        </a>
      </p>
    </div>
  );
}