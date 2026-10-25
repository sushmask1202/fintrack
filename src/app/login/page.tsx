"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

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
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-bold">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-sm">Email</label>
          <input id="email" name="email" type="email" required className="w-full rounded border p-2" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm">Password</label>
          <input id="password" name="password" type="password" required className="w-full rounded border p-2" />
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button disabled={loading} className="w-full rounded bg-black p-2 text-white disabled:opacity-50">
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        No account? <Link href="/signup" className="underline">Sign up</Link>
      </p>
    </main>
  );
}