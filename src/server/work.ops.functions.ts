import { createServerFn } from "@tanstack/react-start";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { workOpsExpenses } from "../db/schema";
import {
  createOpsExpenseSchema,
  updateOpsExpenseSchema,
  deleteOpsExpenseSchema,
} from "./schemas";

import { getAuthUserId } from "./auth.utils";

export const getOpsExpenses = createServerFn({ method: "GET" }).handler(
  async () => {
    const userId = await getAuthUserId();
    const expenses = await db.query.workOpsExpenses.findMany({
      where: eq(workOpsExpenses.userId, userId),
      orderBy: [desc(workOpsExpenses.createdAt)],
    });

    return expenses;
  },
);

export const createOpsExpense = createServerFn({ method: "POST" })
  .inputValidator(createOpsExpenseSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    await db.insert(workOpsExpenses).values({
      userId,
      name: data.name,
      category: data.category,
      amount: data.amount,
      billingCycle: data.billingCycle,
    });

    return { success: true };
  });

export const updateOpsExpense = createServerFn({ method: "POST" })
  .inputValidator(updateOpsExpenseSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    await db
      .update(workOpsExpenses)
      .set({
        name: data.name,
        category: data.category,
        amount: data.amount,
        billingCycle: data.billingCycle,
        isActive: data.isActive,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workOpsExpenses.id, data.id),
          eq(workOpsExpenses.userId, userId),
        ),
      );

    return { success: true };
  });

export const deleteOpsExpense = createServerFn({ method: "POST" })
  .inputValidator(deleteOpsExpenseSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    await db
      .delete(workOpsExpenses)
      .where(
        and(
          eq(workOpsExpenses.id, data.id),
          eq(workOpsExpenses.userId, userId),
        ),
      );

    return { success: true };
  });
