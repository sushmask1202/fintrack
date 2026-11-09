"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { formatMoney } from "@/lib/format";

type Budget = {
  id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  percent: number;
};

function barColor(percent: number) {
  if (percent >= 100) return "bg-rose-400";
  if (percent >= 80) return "bg-amber-300";
  return "bg-sky-300";
}

const label = "mb-1.5 block text-sm text-white/70";

export default function BudgetsPage() {
  const router = useRouter();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [items, setItems] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function refresh() {
    setReloadKey((k) => k + 1);
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const res = await fetch(`/api/budgets?month=${month}`, { cache: "no-store" });
      if (cancelled) return;
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (cancelled) return;
        setItems(data.items);
      }
      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [month, reloadKey, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSaving(true);

    const res = await fetch("/api/budgets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, monthlyLimit: limit }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const fields = (data?.errors?.fieldErrors ?? {}) as Record<string, string[]>;
      const messages = Object.entries(fields).map(([k, v]) => `${k}: ${v.join(", ")}`);
      setErrors(messages.length ? messages : ["Could not save the budget"]);
      setSaving(false);
      return;
    }

    setCategory("");
    setLimit("");
    setSaving(false);
    refresh();
  }

  function startEdit(b: Budget) {
    setCategory(b.category);
    setLimit(String(b.monthlyLimit));
    setErrors([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(b: Budget) {
    if (!confirm(`Delete the ${b.category} budget?`)) return;
    const res = await fetch(`/api/budgets/${b.id}`, { method: "DELETE" });
    if (res.ok) refresh();
  }

  const warnings = items.filter((b) => b.percent >= 80);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <h1 className="text-3xl font-light">Budgets</h1>

      <form onSubmit={onSubmit} className="glass-card space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-medium">Set a monthly budget</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className={label}>Category</label>
            <input
              id="category"
              list="budget-categories"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="auth-input"
            />
            <datalist id="budget-categories">
              {CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="limit" className={label}>Monthly limit</label>
            <input
              id="limit"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="auth-input"
            />
          </div>
        </div>

        {errors.length > 0 && (
          <ul className="space-y-1 text-sm text-rose-300" role="alert">
            {errors.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button disabled={saving} className="dk-btn">
            {saving ? "Saving..." : "Save budget"}
          </button>
          <p className="text-xs text-white/55">Saving a category that already has a budget updates its limit.</p>
        </div>
      </form>

      <section className="space-y-4">
        <div>
          <label htmlFor="month" className={label}>Month</label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            className="auth-input w-auto"
          />
        </div>

        {warnings.length > 0 && (
          <div className="rounded-2xl border border-amber-300/40 bg-amber-300/10 p-4 text-sm text-amber-100" role="status">
            {warnings.map((b) => (
              <p key={b.id}>
                {b.percent >= 100 ? "Over budget" : "Close to the limit"}: <strong>{b.category}</strong> ({b.percent}% used)
              </p>
            ))}
          </div>
        )}

        {loading && <p className="text-sm text-white/60">Loading...</p>}
        {!loading && items.length === 0 && <p className="text-sm text-white/60">No budgets yet. Set one above.</p>}

        <ul className="space-y-3">
          {items.map((b) => (
            <li key={b.id} className="glass-card p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{b.category}</span>
                <span className="text-sm tabular-nums text-white/80">
                  {formatMoney(b.spent)} of {formatMoney(b.monthlyLimit)} ({b.percent}%)
                </span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
                <div className={`h-full rounded-full ${barColor(b.percent)}`} style={{ width: `${Math.min(b.percent, 100)}%` }} />
              </div>
              <div className="mt-3 text-right text-sm">
                <button onClick={() => startEdit(b)} className="mr-3 text-sky-300 hover:underline">Edit</button>
                <button onClick={() => remove(b)} className="text-rose-300 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}