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

// ─── Work Suite Schemas ──────────────────────────────────

export const createWorkMemberSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  role: z.string().min(1, "El rol es requerido"),
  seniority: z.string().min(1, "El seniority es requerido"),
  contractType: z.string().min(1, "El tipo de contrato es requerido"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  netSalary: z.string().min(1, "El salario neto es requerido"),
});

export type CreateWorkMemberInput = z.infer<typeof createWorkMemberSchema>;

export const updateWorkMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "El nombre es requerido"),
  role: z.string().min(1, "El rol es requerido"),
  seniority: z.string().min(1, "El seniority es requerido"),
  contractType: z.string().min(1, "El tipo de contrato es requerido"),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  netSalary: z.string().min(1, "El salario neto es requerido"),
  isActive: z.string().optional(),
  endDate: z.string().optional().nullable(),
});

export type UpdateWorkMemberInput = z.infer<typeof updateWorkMemberSchema>;

export const softDeleteWorkMemberSchema = z.object({
  id: z.string().uuid(),
  endDate: z.string().min(1, "La fecha de terminación es requerida"),
});

export type SoftDeleteWorkMemberInput = z.infer<
  typeof softDeleteWorkMemberSchema
>;
