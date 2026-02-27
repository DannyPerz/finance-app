import { z } from "zod";

// ─── Enums ───────────────────────────────────────────────

export const currencyValues = ["COP", "USD", "EUR"] as const;
export const accountTypeValues = ["bank", "wallet"] as const;
export const transactionTypeValues = ["income", "expense", "transfer"] as const;
export const categoryTypeValues = ["income", "expense"] as const;
export const frequencyValues = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "yearly",
] as const;

// ─── Account Schemas ─────────────────────────────────────

export const createAccountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(accountTypeValues),
  currency: z.enum(currencyValues).default("COP"),
  balance: z.string().default("0"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

// ─── Transaction Schemas ─────────────────────────────────

export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  debtId: z.string().uuid().optional(),
  type: z.enum(transactionTypeValues),
  amount: z.string().min(1, "El monto es requerido"),
  description: z.string().optional(),
  date: z.string().min(1, "La fecha es requerida"),
  transferToAccountId: z.string().uuid().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

// ─── Category Schemas ────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  icon: z.string().default("circle"),
  type: z.enum(categoryTypeValues),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// ─── Budget Schemas ──────────────────────────────────────

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.string().min(1, "El monto es requerido"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

// ─── Debt Schemas ────────────────────────────────────────

export const createDebtSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  principal: z.string().min(1),
  interestRate: z.string().min(1),
  totalInstallments: z.number().min(1),
  paidInstallments: z.number().min(0).default(0),
  monthlyPayment: z.string().min(1),
  remainingBalance: z.string().min(1),
});

export type CreateDebtInput = z.infer<typeof createDebtSchema>;

// ─── Goal Schemas ────────────────────────────────────────

export const createGoalSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  targetAmount: z.string().min(1),
  currentAmount: z.string().default("0"),
  deadline: z.string().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

// ─── Recurring Transaction Schemas ───────────────────────

export const createRecurringTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(transactionTypeValues),
  amount: z.string().min(1),
  description: z.string().optional(),
  frequency: z.enum(frequencyValues),
  nextDate: z.string().min(1),
});

export type CreateRecurringTransactionInput = z.infer<
  typeof createRecurringTransactionSchema
>;
