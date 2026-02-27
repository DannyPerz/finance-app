import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { recurringTransactions, accounts, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createRecurringTransactionSchema } from "./schemas";

const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

export const getRecurringTransactions = createServerFn().handler(async () => {
  const result = await db
    .select({
      id: recurringTransactions.id,
      type: recurringTransactions.type,
      amount: recurringTransactions.amount,
      description: recurringTransactions.description,
      frequency: recurringTransactions.frequency,
      nextDate: recurringTransactions.nextDate,
      isActive: recurringTransactions.isActive,
      accountName: accounts.name,
      categoryName: categories.name,
    })
    .from(recurringTransactions)
    .leftJoin(accounts, eq(recurringTransactions.accountId, accounts.id))
    .leftJoin(categories, eq(recurringTransactions.categoryId, categories.id))
    .where(eq(recurringTransactions.userId, TEMP_USER_ID))
    .orderBy(desc(recurringTransactions.createdAt));
  return result;
});

export const createRecurringTransaction = createServerFn({ method: "POST" })
  .inputValidator(createRecurringTransactionSchema)
  .handler(async ({ data }) => {
    const [newRecurring] = await db
      .insert(recurringTransactions)
      .values({
        userId: TEMP_USER_ID,
        accountId: data.accountId,
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        frequency: data.frequency,
        nextDate: data.nextDate,
      })
      .returning();
    return newRecurring;
  });
