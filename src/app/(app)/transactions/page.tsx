"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { formatDate, formatMoney } from "@/lib/format";

type Tx = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  category: string;
  note: string | null;
  date: string;
};

const PAGE_SIZE = 10;
const today = () => new Date().toLocaleDateString("en-CA");
const emptyForm = () => ({
  type: "EXPENSE" as "INCOME" | "EXPENSE",
  amount: "",
  category: "",
  note: "",
  date: today(),
});

export default function TransactionsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Tx[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ type: "", category: "", from: "", to: "" });
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  function refresh() {
    setReloadKey((k) => k + 1);
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const q = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (filters.type) q.set("type", filters.type);
      if (filters.category) q.set("category", filters.category);
      if (filters.from) q.set("from", filters.from);
      if (filters.to) q.set("to", filters.to);

      const res = await fetch("/api/transactions?" + q.toString(), { cache: "no-store" });
      if (cancelled) return;
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      }
      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [page, filters, reloadKey, router]);

  function changeFilter(key: keyof typeof filters, value: string) {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSaving(true);

    const res = await fetch(editingId ? `/api/transactions/${editingId}` : "/api/transactions", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const fields = (data?.errors?.fieldErrors ?? {}) as Record<string, string[]>;
      const messages = Object.entries(fields).map(([k, v]) => `${k}: ${v.join(", ")}`);
      setErrors(messages.length ? messages : ["Could not save the transaction"]);
      setSaving(false);
      return;
    }

     setForm(emptyForm());
    setEditingId(null);
    setSaving(false);
    if (!editingId) setPage(1);
    refresh();
  }

  function startEdit(t: Tx) {
    setEditingId(t.id);
    setForm({
      type: t.type,
      amount: String(Number(t.amount)),
      category: t.category,
      note: t.note ?? "",
      date: t.date.slice(0, 10),
    });
    setErrors([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
    setErrors([]);
  }

  async function remove(t: Tx) {
    if (!confirm(`Delete ${formatMoney(t.amount)} (${t.category})?`)) return;
    const res = await fetch(`/api/transactions/${t.id}`, { method: "DELETE" });
    if (!res.ok) return;
    if (items.length === 1 && page > 1) setPage(page - 1);
    else refresh();
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const input = "w-full rounded border p-2";

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Transactions</h1>

      <form onSubmit={onSubmit} className="space-y-3 rounded border p-4">
        <h2 className="font-semibold">{editingId ? "Edit transaction" : "Add transaction"}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="type" className="block text-sm">Type</label>
            <select id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "INCOME" | "EXPENSE" })} className={input}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm">Amount</label>
            <input id="amount" type="number" step="0.01" min="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={input} />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm">Category</label>
            <input id="category" list="category-list" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={input} />
            <datalist id="category-list">
              {CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm">Date</label>
            <input id="date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={input} />
          </div>
          <div>
            <label htmlFor="note" className="block text-sm">Note</label>
            <input id="note" maxLength={200} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={input} />
          </div>
        </div>

        {errors.length > 0 && (
          <ul className="text-sm text-red-600" role="alert">
            {errors.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        )}

        <div className="flex gap-2">
          <button disabled={saving} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
            {saving ? "Saving..." : editingId ? "Save changes" : "Add"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="rounded border px-4 py-2">Cancel</button>
          )}
        </div>
      </form>

      <section className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select aria-label="Filter by type" value={filters.type} onChange={(e) => changeFilter("type", e.target.value)} className={input}>
            <option value="">All types</option>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
          <select aria-label="Filter by category" value={filters.category} onChange={(e) => changeFilter("category", e.target.value)} className={input}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input aria-label="From date" type="date" value={filters.from} onChange={(e) => changeFilter("from", e.target.value)} className={input} />
          <input aria-label="To date" type="date" value={filters.to} onChange={(e) => changeFilter("to", e.target.value)} className={input} />
        </div>

        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Type</th>
                <th className="p-2">Category</th>
                <th className="p-2">Note</th>
                <th className="p-2 text-right">Amount</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center">No transactions yet.</td></tr>
              )}
              {!loading && items.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="p-2 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="p-2">{t.type === "INCOME" ? "Income" : "Expense"}</td>
                  <td className="p-2">{t.category}</td>
                  <td className="p-2">{t.note}</td>
                  <td className={`p-2 text-right whitespace-nowrap ${t.type === "INCOME" ? "text-green-700" : "text-red-700"}`}>
                    {t.type === "INCOME" ? "+" : "-"}{formatMoney(t.amount)}
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    <button onClick={() => startEdit(t)} className="mr-2 underline">Edit</button>
                    <button onClick={() => remove(t)} className="underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>{total} transaction{total === 1 ? "" : "s"}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </section>
    </main>
  );
}