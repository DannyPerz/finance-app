import { z } from "zod";

// ─── Enums ───────────────────────────────────────────────

export const transactionTypeValues = ["income", "expense"] as const;
export const categoryTypeValues = ["income", "expense"] as const;
export const recurrenceValues = ["weekly", "biweekly", "monthly"] as const;

// ─── Transaction Schemas ─────────────────────────────────

export const createTransactionSchema = z.object({
  categoryId: z.string().uuid().optional(),
  type: z.enum(transactionTypeValues),
  amount: z.string().min(1, "El monto es requerido"),
  description: z.string().optional(),
  date: z.string().min(1, "La fecha es requerida"),
  isRecurring: z.boolean().optional().default(false),
  recurrence: z.enum(recurrenceValues).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(transactionTypeValues),
  amount: z.string().min(1, "El monto es requerido"),
  description: z.string().optional(),
  date: z.string().min(1, "La fecha es requerida"),
  isRecurring: z.boolean().optional().default(false),
  recurrence: z.enum(recurrenceValues).optional(),
});

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export const deleteTransactionSchema = z.object({
  id: z.string().uuid(),
});

// ─── Category Schemas ────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  icon: z.string().default("circle"),
  type: z.enum(categoryTypeValues),
  budget: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  icon: z.string(),
  type: z.enum(categoryTypeValues),
  budget: z.string().optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const deleteCategorySchema = z.object({
  id: z.string().uuid(),
});
