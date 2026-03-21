import {
  pgTable,
  text,
  timestamp,
  numeric,
  date,
  pgEnum,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
]);

export const categoryTypeEnum = pgEnum("category_type", ["income", "expense"]);

export const recurrenceEnum = pgEnum("recurrence_type", [
  "weekly",
  "biweekly",
  "monthly",
]);

// ─── Users ───────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─── Categories ──────────────────────────────────────────

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("circle"),
  type: categoryTypeEnum("type").notNull(),
  budget: numeric("budget", { precision: 18, scale: 2 }),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Transactions (Movimientos) ──────────────────────────

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurrence: recurrenceEnum("recurrence"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Savings Goals ───────────────────────────────────────

export const savingsGoals = pgTable("savings_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("PiggyBank"),
  targetAmount: numeric("target_amount", { precision: 18, scale: 2 }).notNull(),
  savedAmount: numeric("saved_amount", { precision: 18, scale: 2 })
    .notNull()
    .default("0"),
  deadline: date("deadline"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Exports from Other Suites ───────────────────────────
export * from "./schema.work";
export * from "./auth-schema";
