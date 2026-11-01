import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({ getUserId: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { transaction: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import { GET, POST } from "./route";

const post = (body: unknown) =>
  new Request("http://localhost/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const valid = { type: "EXPENSE", amount: 250.5, category: "Food", date: "2026-10-24" };

beforeEach(() => {
  vi.resetAllMocks();
});

describe("GET /api/transactions", () => {
  it("returns 401 when not logged in", async () => {
    vi.mocked(getUserId).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/transactions"));
    expect(res.status).toBe(401);
    expect(prisma.transaction.findMany).not.toHaveBeenCalled();
  });

  it("only reads the logged-in user's rows and applies filters and paging", async () => {
    vi.mocked(getUserId).mockResolvedValue("user-1");
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.transaction.count).mockResolvedValue(0 as never);

    const res = await GET(new Request("http://localhost/api/transactions?page=2&pageSize=5&type=EXPENSE"));

    expect(res.status).toBe(200);
    expect(prisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-1", type: "EXPENSE" }),
        skip: 5,
        take: 5,
      }),
    );
  });

  it("returns 400 for an invalid query", async () => {
    vi.mocked(getUserId).mockResolvedValue("user-1");
    const res = await GET(new Request("http://localhost/api/transactions?pageSize=500"));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/transactions", () => {
  it("returns 401 when not logged in", async () => {
    vi.mocked(getUserId).mockResolvedValue(null);
    const res = await POST(post(valid));
    expect(res.status).toBe(401);
    expect(prisma.transaction.create).not.toHaveBeenCalled();
  });

  it("returns 400 and saves nothing for invalid input", async () => {
    vi.mocked(getUserId).mockResolvedValue("user-1");
    const res = await POST(post({ ...valid, amount: -5, category: "" }));
    expect(res.status).toBe(400);
    expect(prisma.transaction.create).not.toHaveBeenCalled();
  });

  it("takes the user id from the session, never from the request body", async () => {
    vi.mocked(getUserId).mockResolvedValue("user-1");
    vi.mocked(prisma.transaction.create).mockResolvedValue({ id: "t1" } as never);

    const res = await POST(post({ ...valid, userId: "attacker" }));

    expect(res.status).toBe(201);
    expect(prisma.transaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: "user-1" }),
    });
  });
});