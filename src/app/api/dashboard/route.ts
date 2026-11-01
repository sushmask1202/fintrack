import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
});

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = querySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const now = new Date();
  const [y, m] = parsed.data.month
    ? parsed.data.month.split("-").map(Number)
    : [now.getUTCFullYear(), now.getUTCMonth() + 1];

  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  const trendStart = new Date(Date.UTC(y, m - 6, 1));

  const [byType, byCategory, trendRows] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: trendStart, lt: end } },
      select: { date: true, type: true, amount: true },
    }),
  ]);

  const income = Number(byType.find((r) => r.type === "INCOME")?._sum.amount ?? 0);
  const expense = Number(byType.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0);

  const trend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (5 - i), 1));
    return { month: monthKey(d.getUTCFullYear(), d.getUTCMonth() + 1), income: 0, expense: 0 };
  });

  for (const row of trendRows) {
    const key = monthKey(row.date.getUTCFullYear(), row.date.getUTCMonth() + 1);
    const bucket = trend.find((t) => t.month === key);
    if (!bucket) continue;
    if (row.type === "INCOME") bucket.income += Number(row.amount);
    else bucket.expense += Number(row.amount);
  }

  return NextResponse.json({
    income,
    expense,
    balance: income - expense,
    byCategory: byCategory
      .map((r) => ({ category: r.category, total: Number(r._sum.amount ?? 0) }))
      .sort((a, b) => b.total - a.total),
    trend,
  });
}