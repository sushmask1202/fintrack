"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

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
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-bold">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="name" className="block text-sm">Name (optional)</label>
          <input id="name" name="name" className="w-full rounded border p-2" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm">Email</label>
          <input id="email" name="email" type="email" required className="w-full rounded border p-2" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm">Password (min 8 characters)</label>
          <input id="password" name="password" type="password" required minLength={8} className="w-full rounded border p-2" />
        </div>
        {errors.length > 0 && (
          <ul className="text-sm text-red-600" role="alert">
            {errors.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        )}
        <button disabled={loading} className="w-full rounded bg-black p-2 text-white disabled:opacity-50">
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account? <Link href="/login" className="underline">Log in</Link>
      </p>
    </main>
  );
}