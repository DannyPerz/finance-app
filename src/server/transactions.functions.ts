import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { transactions, accounts, categories } from "@/db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { createTransactionSchema } from "./schemas";

const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

export const getTransactions = createServerFn().handler(async () => {
  const result = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      createdAt: transactions.createdAt,
      accountName: accounts.name,
      categoryName: categories.name,
      categoryIcon: categories.icon,
    })
    .from(transactions)
    .leftJoin(accounts, eq(transactions.accountId, accounts.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, TEMP_USER_ID))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(50);
  return result;
});

export const createTransaction = createServerFn({ method: "POST" })
  .inputValidator(createTransactionSchema)
  .handler(async ({ data }) => {
    const [newTx] = await db
      .insert(transactions)
      .values({
        userId: TEMP_USER_ID,
        accountId: data.accountId,
        categoryId: data.categoryId,
        debtId: data.debtId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date,
        transferToAccountId: data.transferToAccountId,
      })
      .returning();

    // Update account balance
    if (data.type === "income") {
      await db
        .update(accounts)
        .set({
          balance: sql`${accounts.balance}::numeric + ${data.amount}::numeric`,
        })
        .where(eq(accounts.id, data.accountId));
    } else if (data.type === "expense") {
      await db
        .update(accounts)
        .set({
          balance: sql`${accounts.balance}::numeric - ${data.amount}::numeric`,
        })
        .where(eq(accounts.id, data.accountId));
    } else if (data.type === "transfer" && data.transferToAccountId) {
      await db
        .update(accounts)
        .set({
          balance: sql`${accounts.balance}::numeric - ${data.amount}::numeric`,
        })
        .where(eq(accounts.id, data.accountId));
      await db
        .update(accounts)
        .set({
          balance: sql`${accounts.balance}::numeric + ${data.amount}::numeric`,
        })
        .where(eq(accounts.id, data.transferToAccountId));
    }

    return newTx;
  });

export const getMonthSummary = createServerFn().handler(async () => {
  const now = new Date();
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

  const result = await db
    .select({
      type: transactions.type,
      total: sql<string>`COALESCE(SUM(${transactions.amount}::numeric), 0)::text`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, TEMP_USER_ID),
        gte(transactions.date, firstDay),
        lte(transactions.date, lastDay),
      ),
    )
    .groupBy(transactions.type);

  const income = result.find((r) => r.type === "income")?.total ?? "0";
  const expense = result.find((r) => r.type === "expense")?.total ?? "0";

  return { income, expense };
});
