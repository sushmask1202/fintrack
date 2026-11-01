import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn(), create: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";
import { POST } from "./route";

const request = (body: unknown) =>
  new Request("http://localhost/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.resetAllMocks();
});

describe("POST /api/signup", () => {
  it("returns 400 for a weak password", async () => {
    const res = await POST(request({ email: "a@b.com", password: "short" }));
    expect(res.status).toBe(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("returns 409 when the email is already registered", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1" } as never);
    const res = await POST(request({ email: "a@b.com", password: "password123" }));
    expect(res.status).toBe(409);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("stores a bcrypt hash, never the plain password", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.user.create).mockResolvedValue({ id: "u1", email: "a@b.com", name: null } as never);

    const res = await POST(request({ email: "a@b.com", password: "password123" }));

    expect(res.status).toBe(201);
    const arg = vi.mocked(prisma.user.create).mock.calls[0][0] as unknown as {
      data: { passwordHash: string };
    };
    expect(arg.data.passwordHash).not.toBe("password123");
    expect(arg.data.passwordHash).toMatch(/^\$2[aby]\$/);
  });
});