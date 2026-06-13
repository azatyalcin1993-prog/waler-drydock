"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Anchor } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
      });
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-deck rounded-xl shadow-2xl border border-border p-8 text-center">
        <Anchor className="h-12 w-12 text-ocean mx-auto mb-4" />
        <h2 className="text-xl font-bold text-navy mb-2">Check your email</h2>
        <p className="text-muted-custom text-sm">
          A confirmation link has been sent to your email address.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-deck rounded-xl shadow-2xl border border-border p-8">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Anchor className="h-8 w-8 text-ocean" />
        <h1 className="text-2xl font-bold text-navy">Waler Drydock</h1>
      </div>
      <p className="text-muted-custom text-sm text-center mb-8">
        Create a new account
      </p>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
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
            placeholder="Min 6 characters"
            minLength={6}
            required
          />
        </div>

        {error && (
          <p className="text-sm text-center font-medium text-rust bg-red-50 p-2.5 rounded border border-red-200">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-custom mt-6">
        Already have an account?{" "}
        <a href="/login" className="text-ocean hover:underline font-medium">
          Sign in
        </a>
      </p>
    </div>
  );
}