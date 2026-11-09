"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import AuthShell, { ArrowDot } from "@/components/AuthShell";

export default function SignUpPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || undefined, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const fieldErrors = data?.errors?.fieldErrors ?? data?.errors ?? {};
      const messages = (Object.values(fieldErrors) as string[][]).flat();
      setErrors(messages.length ? messages : ["Could not sign up"]);
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes a minute. You can start logging right away."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-white underline focus-visible:outline-white">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-white/80">Name (optional)</label>
          <input id="name" name="name" autoComplete="name" className="auth-input" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-white/80">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="auth-input" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-white/80">Password (min 8 characters)</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="auth-input" />
        </div>
        {errors.length > 0 && (
          <ul className="space-y-1 text-sm text-rose-300" role="alert">
            {errors.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        )}
        <button disabled={loading} className="auth-button">
          {loading ? "Creating..." : "Sign up"}
          <ArrowDot />
        </button>
      </form>
    </AuthShell>
  );
}