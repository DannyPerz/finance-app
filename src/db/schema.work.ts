import {
  pgTable,
  text,
  timestamp,
  numeric,
  uuid,
  date,
} from "drizzle-orm/pg-core";
import { users } from "./schema";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────────────────
// WORK SUITE SCHEMA
// ─────────────────────────────────────────────────────────

// 1. Team Members
export const workMembers = pgTable("work_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // e.g., 'Backend Developer', 'Frontend Developer'
  seniority: text("seniority").notNull(), // e.g., 'Junior', 'Mid', 'Senior'
  contractType: text("contract_type").notNull(), // e.g., 'Indefinido', 'Temporal', 'Prestación de Servicios'
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // For soft-deletes or traceability when a contract ends
  isActive: text("is_active").default("true").notNull(), // 'true' or 'false'
  baseSalary: numeric("base_salary", { precision: 12, scale: 2 }).notNull(),
  arlLevel: text("arl_level").default("I").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workMembersRelations = relations(workMembers, ({ one, many }) => ({
  user: one(users, {
    fields: [workMembers.userId],
    references: [users.id],
  }),
  payrolls: many(workPayrolls),
}));

// 2. Payrolls / Payments
export const workPayrolls = pgTable("work_payrolls", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  memberId: uuid("member_id")
    .references(() => workMembers.id, { onDelete: "cascade" })
    .notNull(),
  period: text("period").notNull(), // e.g., '2026-03'
  grossSalary: numeric("gross_salary", { precision: 12, scale: 2 }).notNull(),
  deductions: numeric("deductions", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
  bonuses: numeric("bonuses", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
  netPaid: numeric("net_paid", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'paid'
  paymentDate: date("payment_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workPayrollsRelations = relations(workPayrolls, ({ one }) => ({
  user: one(users, {
    fields: [workPayrolls.userId],
    references: [users.id],
  }),
  member: one(workMembers, {
    fields: [workPayrolls.memberId],
    references: [workMembers.id],
  }),
}));

// 3. Vendors / Services (SaaS, Infra, Hardware)
export const workVendors = pgTable("work_vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(), // e.g., 'AWS', 'ClickUp', 'Vercel'
  category: text("category").notNull(), // e.g., 'Software', 'Infrastructure', 'Hardware'
  recurringCost: numeric("recurring_cost", {
    precision: 12,
    scale: 2,
  }).notNull(),
  currency: text("currency").notNull().default("USD"), // e.g., 'USD', 'COP'
  billingCycle: text("billing_cycle").notNull().default("monthly"), // 'monthly', 'yearly'
  nextRenewal: date("next_renewal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workVendorsRelations = relations(workVendors, ({ one, many }) => ({
  user: one(users, {
    fields: [workVendors.userId],
    references: [users.id],
  }),
  invoices: many(workVendorInvoices),
}));

// 4. Vendor Invoices / Operating Costs
export const workVendorInvoices = pgTable("work_vendor_invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  vendorId: uuid("vendor_id")
    .references(() => workVendors.id, { onDelete: "cascade" })
    .notNull(),
  period: text("period").notNull(), // e.g., '2026-03'
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  trm: numeric("trm", { precision: 12, scale: 2 }), // Tasa de Cambio Representativa del Mercado
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workVendorInvoicesRelations = relations(
  workVendorInvoices,
  ({ one }) => ({
    user: one(users, {
      fields: [workVendorInvoices.userId],
      references: [users.id],
    }),
    vendor: one(workVendors, {
      fields: [workVendorInvoices.vendorId],
      references: [workVendors.id],
    }),
  }),
);

// 5. Payroll Config Parameters (SMMLV, Exonerations, Percentages)
export const workPayrollParameters = pgTable("work_payroll_parameters", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  year: numeric("year", { precision: 4, scale: 0 }).notNull(), // ej. 2026
  smmlv: numeric("smmlv", { precision: 12, scale: 2 })
    .notNull()
    .default("1300000"),
  transportAllowance: numeric("transport_allowance", {
    precision: 12,
    scale: 2,
  })
    .notNull()
    .default("162000"),

  // Deducciones Empleado
  healthEmployee: numeric("health_employee", { precision: 5, scale: 4 })
    .notNull()
    .default("0.04"), // 4%
  pensionEmployee: numeric("pension_employee", { precision: 5, scale: 4 })
    .notNull()
    .default("0.04"), // 4%
  solidarityFundThreshold: numeric("solidarity_fund_threshold", {
    precision: 12,
    scale: 2,
  })
    .notNull()
    .default("4"), // 4 SMMLV

  // Carga Prestacional / Provisiones Empleador
  healthEmployer: numeric("health_employer", { precision: 5, scale: 4 })
    .notNull()
    .default("0.085"), // 8.5%
  pensionEmployer: numeric("pension_employer", { precision: 5, scale: 4 })
    .notNull()
    .default("0.12"), // 12%
  ccf: numeric("ccf", { precision: 5, scale: 4 }).notNull().default("0.04"), // 4%
  sena: numeric("sena", { precision: 5, scale: 4 }).notNull().default("0.02"), // 2%
  icbf: numeric("icbf", { precision: 5, scale: 4 }).notNull().default("0.03"), // 3%
  severance: numeric("severance", { precision: 5, scale: 4 })
    .notNull()
    .default("0.0833"), // 8.33%
  serviceBonus: numeric("service_bonus", { precision: 5, scale: 4 })
    .notNull()
    .default("0.0833"), // 8.33%
  vacation: numeric("vacation", { precision: 5, scale: 4 })
    .notNull()
    .default("0.0417"), // 4.17%

  // Ley 1819 Exoneration Limit
  exonerationThreshold: numeric("exoneration_threshold", {
    precision: 12,
    scale: 2,
  })
    .notNull()
    .default("10"), // 10 SMMLV

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workPayrollParametersRelations = relations(
  workPayrollParameters,
  ({ one }) => ({
    user: one(users, {
      fields: [workPayrollParameters.userId],
      references: [users.id],
    }),
  }),
);
