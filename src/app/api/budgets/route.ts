import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import { budgetSchema, monthQuerySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

function monthRange(month?: string) {
  const now = new Date();
  const [y, m] = month
    ? month.split("-").map(Number)
    : [now.getUTCFullYear(), now.getUTCMonth() + 1];
  return {
    start: new Date(Date.UTC(y, m - 1, 1)),
    end: new Date(Date.UTC(y, m, 1)),
  };
}

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = monthQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }
  const { start, end } = monthRange(parsed.data.month);

  const [budgets, spentRows] = await Promise.all([
    prisma.budget.findMany({ where: { userId }, orderBy: { category: "asc" } }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
  ]);

  const spentMap = new Map(spentRows.map((r) => [r.category, Number(r._sum.amount ?? 0)]));

  const items = budgets.map((b) => {
    const limit = Number(b.monthlyLimit);
    const spent = spentMap.get(b.category) ?? 0;
    return {
      id: b.id,
      category: b.category,
      monthlyLimit: limit,
      spent,
      percent: limit > 0 ? Math.round((spent / limit) * 100) : 0,
    };
  });

  return NextResponse.json({ items });
}

export async function PUT(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = budgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }
  const { category, monthlyLimit } = parsed.data;

  const budget = await prisma.budget.upsert({
    where: { userId_category: { userId, category } },
    update: { monthlyLimit },
    create: { userId, category, monthlyLimit },
  });

  return NextResponse.json({ ...budget, monthlyLimit: Number(budget.monthlyLimit) });
}