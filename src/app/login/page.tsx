"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import AuthShell, { ArrowDot } from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to see how this month is going."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-medium text-white underline focus-visible:outline-white">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-white/80">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="auth-input" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-white/80">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="auth-input" />
        </div>
        {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}
        <button disabled={loading} className="auth-button">
          {loading ? "Logging in..." : "Log in"}
          <ArrowDot />
        </button>
      </form>
    </AuthShell>
  );
}