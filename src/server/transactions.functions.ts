import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { transactions, categories } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import {
  createTransactionSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
  importTransactionsSchema,
} from "./schemas";

import { getAuthUserId } from "./auth.utils";

// ─── List Transactions ───────────────────────────────────

export const getTransactions = createServerFn().handler(async () => {
  const userId = await getAuthUserId();
  const result = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      categoryId: transactions.categoryId,
      isRecurring: transactions.isRecurring,
      recurrence: transactions.recurrence,
      createdAt: transactions.createdAt,
      categoryName: categories.name,
      categoryIcon: categories.icon,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));
  return result;
});

// ─── Create Transaction ──────────────────────────────────

export const createTransaction = createServerFn({ method: "POST" })
  .inputValidator(createTransactionSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const [newTx] = await db
      .insert(transactions)
      .values({
        userId,
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date,
        isRecurring: data.isRecurring || false,
        recurrence: data.isRecurring ? data.recurrence : null,
      })
      .returning();
    return newTx;
  });

// ─── Update Transaction ─────────────────────────────────

export const updateTransaction = createServerFn({ method: "POST" })
  .inputValidator(updateTransactionSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const [updated] = await db
      .update(transactions)
      .set({
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date,
        isRecurring: data.isRecurring || false,
        recurrence: data.isRecurring ? data.recurrence : null,
      })
      .where(
        and(
          eq(transactions.id, data.id),
          eq(transactions.userId, userId),
        ),
      )
      .returning();
    return updated;
  });

// ─── Import Transactions (bulk) ─────────────────────────

export const importTransactions = createServerFn({ method: "POST" })
  .inputValidator(importTransactionsSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    await db.insert(transactions).values(
      data.rows.map((row) => ({
        userId,
        categoryId: row.categoryId ?? null,
        type: row.type,
        amount: row.amount,
        description: row.description ?? null,
        date: row.date,
        isRecurring: false,
        recurrence: null,
      })),
    );
    return { imported: data.rows.length };
  });

// ─── Delete Transaction ─────────────────────────────────

export const deleteTransaction = createServerFn({ method: "POST" })
  .inputValidator(deleteTransactionSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.id, data.id),
          eq(transactions.userId, userId),
        ),
      );
    return { success: true };
  });
