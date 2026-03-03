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
  netSalary: numeric("net_salary", { precision: 12, scale: 2 }).notNull(),
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
