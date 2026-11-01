import { describe, expect, it } from "vitest";
import { listQuerySchema, loginSchema, signUpSchema, transactionSchema } from "./validation";

describe("signUpSchema", () => {
  it("accepts a valid sign-up and normalises the email", () => {
    const result = signUpSchema.safeParse({ email: "  Anna@Example.COM ", password: "password123" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("anna@example.com");
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(signUpSchema.safeParse({ email: "a@b.com", password: "short" }).success).toBe(false);
  });

  it("rejects a password longer than 72 characters", () => {
    expect(signUpSchema.safeParse({ email: "a@b.com", password: "x".repeat(73) }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(signUpSchema.safeParse({ email: "not-an-email", password: "password123" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("transactionSchema", () => {
  const valid = { type: "EXPENSE", amount: 100, category: "Food", date: "2026-10-24" };

  it("accepts valid data and converts strings to numbers and dates", () => {
    const result = transactionSchema.safeParse({ ...valid, amount: "250.5", category: " Food " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(250.5);
      expect(result.data.category).toBe("Food");
      expect(result.data.date).toBeInstanceOf(Date);
    }
  });

  it.each([
    ["a negative amount", { amount: -5 }],
    ["a zero amount", { amount: 0 }],
    ["an empty category", { category: "" }],
    ["an unknown type", { type: "TRANSFER" }],
    ["an invalid date", { date: "nope" }],
    ["a note over 200 characters", { note: "x".repeat(201) }],
  ])("rejects %s", (_name, override) => {
    expect(transactionSchema.safeParse({ ...valid, ...override }).success).toBe(false);
  });
});

describe("listQuerySchema", () => {
  it("uses sensible defaults", () => {
    const result = listQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("rejects a page size over 100 and a page below 1", () => {
    expect(listQuerySchema.safeParse({ pageSize: 101 }).success).toBe(false);
    expect(listQuerySchema.safeParse({ page: 0 }).success).toBe(false);
  });
});