"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/format";

type Summary = {
  income: number;
  expense: number;
  balance: number;
  byCategory: { category: string; total: number }[];
  trend: { month: string; income: number; expense: number }[];
};

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d", "#ea580c", "#64748b"];

function monthLabel(m: string) {
  return new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

const compact = (v: number) => new Intl.NumberFormat("en-IN", { notation: "compact" }).format(v);

export default function DashboardPage() {
  const router = useRouter();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const res = await fetch(`/api/dashboard?month=${month}`, { cache: "no-store" });
      if (cancelled) return;
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const json = await res.json();
        if (cancelled) return;
        setData(json);
      }
      setFailed(!res.ok);
      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [month, router]);

  const trend = data?.trend.map((t) => ({ ...t, label: monthLabel(t.month) })) ?? [];

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="month" className="text-sm">Month</label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            className="rounded border p-2"
          />
        </div>
      </div>

      {loading && <p className="text-sm">Loading...</p>}
      {failed && <p className="text-sm text-red-600" role="alert">Could not load the dashboard.</p>}

      {data && (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded border p-4">
              <p className="text-sm text-gray-600">Income</p>
              <p className="text-xl font-semibold text-green-700">{formatMoney(data.income)}</p>
            </div>
            <div className="rounded border p-4">
              <p className="text-sm text-gray-600">Expenses</p>
              <p className="text-xl font-semibold text-red-700">{formatMoney(data.expense)}</p>
            </div>
            <div className="rounded border p-4">
              <p className="text-sm text-gray-600">Balance</p>
              <p className={`text-xl font-semibold ${data.balance < 0 ? "text-red-700" : "text-green-700"}`}>
                {formatMoney(data.balance)}
              </p>
            </div>
          </section>

          <section className="rounded border p-4">
            <h2 className="mb-2 font-semibold">Spending by category</h2>
            {data.byCategory.length === 0 ? (
              <p className="text-sm">No expenses in this month.</p>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.byCategory} dataKey="total" nameKey="category" innerRadius={55} outerRadius={95}>
                      {data.byCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatMoney(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="rounded border p-4">
            <h2 className="mb-2 font-semibold">Last 6 months</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(v) => compact(Number(v))} />
                  <Tooltip formatter={(value) => formatMoney(Number(value))} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#16a34a" />
                  <Bar dataKey="expense" name="Expenses" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </main>
  );
}