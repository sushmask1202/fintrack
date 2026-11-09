"use client";

import Link from "next/link";
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

const COLORS = ["#7dd3fc", "#2563eb", "#a78bfa", "#34d399", "#fbbf24", "#fb7185", "#22d3ee", "#f472b6", "#94a3b8", "#818cf8"];
const tooltipStyle = {
  background: "#0b1a33",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  color: "#fff",
};
const tick = { fill: "rgba(255,255,255,0.65)", fontSize: 12 };

function monthLabel(m: string) {
  return new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

function monthTitle(m: string) {
  return new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const compact = (v: number) => new Intl.NumberFormat("en-IN", { notation: "compact" }).format(v);

function summaryLine(d: Summary) {
  if (d.income === 0 && d.expense === 0) return "";
  if (d.income === 0) return "No income logged this month.";
  if (d.balance < 0) return `You spent ${formatMoney(-d.balance)} more than you earned.`;
  return `You kept ${Math.round((d.balance / d.income) * 100)}% of what came in.`;
}

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
  const empty = data !== null && data.income === 0 && data.expense === 0;
  const line = data ? summaryLine(data) : "";

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-light">Dashboard</h1>
        <div>
          <label htmlFor="month" className="mb-1.5 block text-sm text-white/70">Month</label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            className="auth-input w-auto"
          />
        </div>
      </div>

      {loading && <p className="text-sm text-white/60">Loading...</p>}
      {failed && (
        <p className="text-sm text-rose-300" role="alert">
          Could not load the dashboard. Refresh the page to try again.
        </p>
      )}

      {data && (
        <>
          <section
            className="rounded-3xl border border-white/15 p-6 backdrop-blur-xl sm:p-8"
            style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.4), rgba(255,255,255,0.05))" }}
          >
            <p className="text-sm text-white/70">Balance for {monthTitle(month)}</p>
            <p className={`mt-1 text-5xl font-light tabular-nums ${data.balance < 0 ? "text-rose-300" : ""}`}>
              {formatMoney(data.balance)}
            </p>
            {line && <p className="mt-2 text-sm text-white/75">{line}</p>}
            <dl className="mt-6 grid grid-cols-2 gap-6 border-t border-white/15 pt-5">
              <div>
                <dt className="text-sm text-white/65">Income</dt>
                <dd className="mt-1 text-xl tabular-nums text-emerald-300">{formatMoney(data.income)}</dd>
              </div>
              <div>
                <dt className="text-sm text-white/65">Expenses</dt>
                <dd className="mt-1 text-xl tabular-nums text-rose-300">{formatMoney(data.expense)}</dd>
              </div>
            </dl>
          </section>

          {empty && (
            <div className="glass-card border-dashed p-6 text-center">
              <p className="font-medium">Nothing logged for {monthTitle(month)} yet.</p>
              <p className="mt-1 text-sm text-white/65">Add an expense or some income and this page fills in.</p>
              <Link href="/transactions" className="dk-btn mt-4 focus-visible:outline-white">
                Add your first transaction
              </Link>
            </div>
          )}

          <section className="glass-card p-5 sm:p-6">
            <h2 className="text-lg font-medium">Where it went</h2>
            {data.byCategory.length === 0 ? (
              <p className="mt-2 text-sm text-white/65">No expenses in this month.</p>
            ) : (
              <div className="mt-4 grid items-center gap-6 sm:grid-cols-2">
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.byCategory}
                        dataKey="total"
                        nameKey="category"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {data.byCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatMoney(Number(value))}
                        contentStyle={tooltipStyle}
                        itemStyle={{ color: "#fff" }}
                        labelStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="space-y-2.5">
                  {data.byCategory.map((c, i) => (
                    <li key={c.category} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                        {c.category}
                      </span>
                      <span className="tabular-nums">
                        {formatMoney(c.total)}{" "}
                        <span className="text-white/55">({Math.round((c.total / data.expense) * 100)}%)</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="glass-card p-5 sm:p-6">
            <h2 className="text-lg font-medium">Last 6 months</h2>
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                  <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={tick} stroke="rgba(255,255,255,0.25)" />
                  <YAxis tickFormatter={(v) => compact(Number(v))} tick={tick} stroke="rgba(255,255,255,0.25)" />
                  <Tooltip
                    formatter={(value) => formatMoney(Number(value))}
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#fff" }}
                    cursor={{ fill: "rgba(255,255,255,0.06)" }}
                  />
                  <Legend formatter={(value) => <span style={{ color: "rgba(255,255,255,0.8)" }}>{value}</span>} />
                  <Bar dataKey="income" name="Income" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#fb7185" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </main>
  );
}