import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { transactions, categories } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import {
  createTransactionSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
} from "./schemas";

const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

// ─── List Transactions ───────────────────────────────────

export const getTransactions = createServerFn().handler(async () => {
  const result = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      categoryId: transactions.categoryId,
      createdAt: transactions.createdAt,
      categoryName: categories.name,
      categoryIcon: categories.icon,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, TEMP_USER_ID))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));
  return result;
});

// ─── Create Transaction ──────────────────────────────────

export const createTransaction = createServerFn({ method: "POST" })
  .inputValidator(createTransactionSchema)
  .handler(async ({ data }) => {
    const [newTx] = await db
      .insert(transactions)
      .values({
        userId: TEMP_USER_ID,
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date,
      })
      .returning();
    return newTx;
  });

// ─── Update Transaction ─────────────────────────────────

export const updateTransaction = createServerFn({ method: "POST" })
  .inputValidator(updateTransactionSchema)
  .handler(async ({ data }) => {
    const [updated] = await db
      .update(transactions)
      .set({
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date,
      })
      .where(
        and(
          eq(transactions.id, data.id),
          eq(transactions.userId, TEMP_USER_ID),
        ),
      )
      .returning();
    return updated;
  });

// ─── Delete Transaction ─────────────────────────────────

export const deleteTransaction = createServerFn({ method: "POST" })
  .inputValidator(deleteTransactionSchema)
  .handler(async ({ data }) => {
    await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.id, data.id),
          eq(transactions.userId, TEMP_USER_ID),
        ),
      );
    return { success: true };
  });
