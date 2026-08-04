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

export const toggleTransactionPaidSchema = z.object({
  id: z.string().uuid(),
  isPaid: z.boolean(),
});

export const importTransactionRowSchema = z.object({
  type: z.enum(transactionTypeValues),
  amount: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  date: z.string().min(1),
});

export const importTransactionsSchema = z.object({
  rows: z.array(importTransactionRowSchema).min(1),
});

export type ImportTransactionsInput = z.infer<typeof importTransactionsSchema>;

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

// ─── Savings Goals Schemas ───────────────────────────────

export const createGoalSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  icon: z.string().default("PiggyBank"),
  targetAmount: z.string().min(1, "El monto objetivo es requerido"),
  deadline: z.string().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  icon: z.string(),
  targetAmount: z.string().min(1, "El monto objetivo es requerido"),
  deadline: z.string().optional(),
});

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

export const contributeGoalSchema = z.object({
  id: z.string().uuid(),
  amount: z.string().min(1, "El monto es requerido"),
});

export type ContributeGoalInput = z.infer<typeof contributeGoalSchema>;

export const deleteGoalSchema = z.object({
  id: z.string().uuid(),
});

// ─── Savings Challenge Schemas ───────────────────────────

export const createChallengeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
});

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;

export const toggleChallengeDaySchema = z.object({
  id: z.string().uuid(),
  day: z.number().int().min(1).max(100),
  paid: z.boolean(),
});

export const deleteChallengeSchema = z.object({
  id: z.string().uuid(),
});

export const resetChallengeSchema = z.object({
  id: z.string().uuid(),
});
