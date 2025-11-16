"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("Sending magic link...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/chat`
            : undefined,
      },
    });

    if (error) {
      setStatus("Error: " + error.message);
    } else {
      setStatus("Check your email for a login link.");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            DeepMirror · Login
          </p>
          <h1 className="text-2xl font-semibold">Sign in to DeepMirror</h1>
          <p className="text-sm text-slate-400">
            Enter your email and we&apos;ll send you a magic link. No password
            needed.
          </p>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 text-slate-950 text-sm font-medium py-2.5 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Sending..." : "Send magic link"}
          </button>
        </form>

        {status && (
          <p className="text-xs text-slate-400">
            {status}
          </p>
        )}

        <p className="text-xs text-slate-500">
          <Link href="/" className="underline underline-offset-2">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
