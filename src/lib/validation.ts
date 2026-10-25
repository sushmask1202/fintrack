import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().positive().max(1_000_000_000),
  category: z.string().trim().min(1).max(50),
  note: z.string().trim().max(200).optional(),
  date: z.coerce.date(),
});

export const transactionUpdateSchema = transactionSchema.partial();

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().trim().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});