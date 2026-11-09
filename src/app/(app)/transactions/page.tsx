"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CategoryCombobox from "@/components/CategoryCombobox";
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

const label = "mb-1.5 block text-sm text-white/70";

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
  const [notice, setNotice] = useState("");

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

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(id);
  }, [notice]);

  function changeFilter(key: keyof typeof filters, value: string) {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setNotice("");
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

    const saved: Tx | null = await res.json().catch(() => null);
    const wasEditing = editingId !== null;

    setForm(emptyForm());
    setEditingId(null);
    setSaving(false);
    setNotice(
      saved
        ? `${wasEditing ? "Updated" : "Added"}: ${formatMoney(saved.amount)} in ${saved.category}`
        : wasEditing
          ? "Changes saved"
          : "Transaction added",
    );

    if (!wasEditing && saved) {
      setFilters({ type: "", category: "", from: "", to: "" });
      setPage(1);
      setItems((prev) => [saved, ...prev].slice(0, PAGE_SIZE));
      setTotal((t) => t + 1);
    }
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

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <h1 className="text-3xl font-light">Transactions</h1>

      <form onSubmit={onSubmit} className="glass-card relative z-10 space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-medium">{editingId ? "Edit transaction" : "Add transaction"}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="type" className={label}>Type</label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "INCOME" | "EXPENSE" })}
              className="auth-input"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
          <div>
            <label htmlFor="amount" className={label}>Amount</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="auth-input"
            />
          </div>
          <div>
            <label htmlFor="category" className={label}>Category</label>
            <CategoryCombobox
              id="category"
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v })}
              options={CATEGORIES}
            />
          </div>
          <div>
            <label htmlFor="date" className={label}>Date</label>
            <input
              id="date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="auth-input"
            />
          </div>
          <div>
            <label htmlFor="note" className={label}>Note</label>
            <input
              id="note"
              maxLength={200}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="auth-input"
            />
          </div>
        </div>

        {errors.length > 0 && (
          <ul className="space-y-1 text-sm text-rose-300" role="alert">
            {errors.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        )}

        <div className="flex gap-3">
          <button disabled={saving} className="dk-btn">
            {saving ? "Saving..." : editingId ? "Save changes" : "Add"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="dk-btn dk-btn-ghost">Cancel</button>
          )}
        </div>
      </form>

      {notice && (
        <p
          className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200"
          role="status"
        >
          {notice}
        </p>
      )}

      <section className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            aria-label="Filter by type"
            value={filters.type}
            onChange={(e) => changeFilter("type", e.target.value)}
            className="auth-input"
          >
            <option value="">All types</option>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
          <select
            aria-label="Filter by category"
            value={filters.category}
            onChange={(e) => changeFilter("category", e.target.value)}
            className="auth-input"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            aria-label="From date"
            type="date"
            value={filters.from}
            onChange={(e) => changeFilter("from", e.target.value)}
            className="auth-input"
          />
          <input
            aria-label="To date"
            type="date"
            value={filters.to}
            onChange={(e) => changeFilter("to", e.target.value)}
            className="auth-input"
          />
        </div>

        <div className="glass-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-white/60">
              <tr>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Note</th>
                <th className="p-3 text-right font-medium">Amount</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="p-6 text-center text-white/60">Loading...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-white/60">No transactions yet.</td></tr>
              )}
              {!loading && items.map((t) => (
                <tr key={t.id} className="border-b border-white/10 last:border-0 hover:bg-white/5">
                  <td className="whitespace-nowrap p-3 text-white/80">{formatDate(t.date)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs ${
                        t.type === "INCOME" ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"
                      }`}
                    >
                      {t.type === "INCOME" ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td className="p-3">{t.category}</td>
                  <td className="p-3 text-white/65">{t.note}</td>
                  <td
                    className={`whitespace-nowrap p-3 text-right tabular-nums ${
                      t.type === "INCOME" ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    {t.type === "INCOME" ? "+" : "-"}{formatMoney(t.amount)}
                  </td>
                  <td className="whitespace-nowrap p-3 text-right">
                    <button onClick={() => startEdit(t)} className="mr-3 text-sky-300 hover:underline">Edit</button>
                    <button onClick={() => remove(t)} className="text-rose-300 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm text-white/75">
          <span>{total} transaction{total === 1 ? "" : "s"}</span>
          <div className="flex items-center gap-3">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="dk-btn dk-btn-ghost dk-btn-sm">
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="dk-btn dk-btn-ghost dk-btn-sm">
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}