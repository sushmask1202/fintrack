import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({ getUserId: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { transaction: { updateMany: vi.fn(), deleteMany: vi.fn(), findFirst: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import { DELETE, PATCH } from "./route";

const ctx = { params: Promise.resolve({ id: "tx-1" }) };

const request = (method: string, body?: unknown) =>
  new Request("http://localhost/api/transactions/tx-1", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

beforeEach(() => {
  vi.resetAllMocks();
});

describe("DELETE /api/transactions/[id]", () => {
  it("returns 401 when not logged in", async () => {
    vi.mocked(getUserId).mockResolvedValue(null);
    const res = await DELETE(request("DELETE"), ctx);
    expect(res.status).toBe(401);
    expect(prisma.transaction.deleteMany).not.toHaveBeenCalled();
  });

  it("returns 404 for another user's transaction, and filters by user id", async () => {
    vi.mocked(getUserId).mockResolvedValue("user-1");
    vi.mocked(prisma.transaction.deleteMany).mockResolvedValue({ count: 0 } as never);

    const res = await DELETE(request("DELETE"), ctx);

    expect(res.status).toBe(404);
    expect(prisma.transaction.deleteMany).toHaveBeenCalledWith({
      where: { id: "tx-1", userId: "user-1" },
    });
  });

  it("returns 204 for your own transaction", async () => {
    vi.mocked(getUserId).mockResolvedValue("user-1");
    vi.mocked(prisma.transaction.deleteMany).mockResolvedValue({ count: 1 } as never);
    const res = await DELETE(request("DELETE"), ctx);
    expect(res.status).toBe(204);
  });
});

describe("PATCH /api/transactions/[id]", () => {
  it("returns 400 and changes nothing for invalid input", async () => {
    vi.mocked(getUserId).mockResolvedValue("user-1");
    const res = await PATCH(request("PATCH", { amount: -5 }), ctx);
    expect(res.status).toBe(400);
    expect(prisma.transaction.updateMany).not.toHaveBeenCalled();
  });

  it("returns 404 for another user's transaction", async () => {
    vi.mocked(getUserId).mockResolvedValue("user-1");
    vi.mocked(prisma.transaction.updateMany).mockResolvedValue({ count: 0 } as never);

    const res = await PATCH(request("PATCH", { amount: 300 }), ctx);

    expect(res.status).toBe(404);
    expect(prisma.transaction.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "tx-1", userId: "user-1" } }),
    );
  });

  it("returns the updated transaction for your own", async () => {
    vi.mocked(getUserId).mockResolvedValue("user-1");
    vi.mocked(prisma.transaction.updateMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue({ id: "tx-1", amount: "300" } as never);

    const res = await PATCH(request("PATCH", { amount: 300 }), ctx);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "tx-1", amount: "300" });
  });
});