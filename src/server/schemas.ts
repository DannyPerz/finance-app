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

// ─── Work Suite Schemas ──────────────────────────────────

export const createWorkMemberSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  role: z.string().min(1, "El rol es requerido"),
  seniority: z.string().min(1, "El seniority es requerido"),
  contractType: z.string().min(1, "El tipo de contrato es requerido"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  baseSalary: z.string().min(1, "El salario base (bruto) es requerido"),
  arlLevel: z.enum(["I", "II", "III", "IV", "V"]).optional().default("I"),
});

export type CreateWorkMemberInput = z.infer<typeof createWorkMemberSchema>;

export const updateWorkMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  role: z.string().min(1, "El rol es requerido"),
  seniority: z.string().min(1, "El seniority es requerido"),
  contractType: z.string().min(1, "El tipo de contrato es requerido"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  baseSalary: z.string().min(1, "El salario base (bruto) es requerido"),
  isActive: z.string().optional(),
  endDate: z.string().optional().nullable(),
  arlLevel: z.enum(["I", "II", "III", "IV", "V"]).optional(),
});

export type UpdateWorkMemberInput = z.infer<typeof updateWorkMemberSchema>;

export const softDeleteWorkMemberSchema = z.object({
  id: z.string().uuid(),
  endDate: z.string().min(1, "La fecha de terminación es requerida"),
});

export type SoftDeleteWorkMemberInput = z.infer<
  typeof softDeleteWorkMemberSchema
>;

// ─── Payroll Parameters (Admin) ─────────────────────────

export const updatePayrollParametersSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  smmlv: z.union([z.string(), z.number()]).transform(String),
  transportAllowance: z.union([z.string(), z.number()]).transform(String),
  healthEmployee: z.union([z.string(), z.number()]).transform(String),
  pensionEmployee: z.union([z.string(), z.number()]).transform(String),
  solidarityFundThreshold: z.union([z.string(), z.number()]).transform(String),
  healthEmployer: z.union([z.string(), z.number()]).transform(String),
  pensionEmployer: z.union([z.string(), z.number()]).transform(String),
  ccf: z.union([z.string(), z.number()]).transform(String),
  sena: z.union([z.string(), z.number()]).transform(String),
  icbf: z.union([z.string(), z.number()]).transform(String),
  severance: z.union([z.string(), z.number()]).transform(String),
  serviceBonus: z.union([z.string(), z.number()]).transform(String),
  vacation: z.union([z.string(), z.number()]).transform(String),
  exonerationThreshold: z.union([z.string(), z.number()]).transform(String),
});

export type UpdatePayrollParametersInput = z.infer<
  typeof updatePayrollParametersSchema
>;

// ─── Ops Expenses (Infra & SaaS) ─────────────────────────

export const createOpsExpenseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  amount: z.union([z.string(), z.number()]).transform(String),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
});

export type CreateOpsExpenseInput = z.infer<typeof createOpsExpenseSchema>;

export const updateOpsExpenseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  amount: z.union([z.string(), z.number()]).transform(String),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
  isActive: z.string().optional(),
});

export type UpdateOpsExpenseInput = z.infer<typeof updateOpsExpenseSchema>;

export const deleteOpsExpenseSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteOpsExpenseInput = z.infer<typeof deleteOpsExpenseSchema>;
