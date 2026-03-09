import { createServerFn } from "@tanstack/react-start";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { workOpsExpenses } from "../db/schema";
import {
  createOpsExpenseSchema,
  updateOpsExpenseSchema,
  deleteOpsExpenseSchema,
} from "./schemas";

const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

export const getOpsExpenses = createServerFn({ method: "GET" }).handler(
  async () => {
    const expenses = await db.query.workOpsExpenses.findMany({
      where: eq(workOpsExpenses.userId, TEMP_USER_ID),
      orderBy: [desc(workOpsExpenses.createdAt)],
    });

    return expenses;
  },
);

export const createOpsExpense = createServerFn({ method: "POST" })
  .inputValidator(createOpsExpenseSchema)
  .handler(async ({ data }) => {
    await db.insert(workOpsExpenses).values({
      userId: TEMP_USER_ID,
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
          eq(workOpsExpenses.userId, TEMP_USER_ID),
        ),
      );

    return { success: true };
  });

export const deleteOpsExpense = createServerFn({ method: "POST" })
  .inputValidator(deleteOpsExpenseSchema)
  .handler(async ({ data }) => {
    await db
      .delete(workOpsExpenses)
      .where(
        and(
          eq(workOpsExpenses.id, data.id),
          eq(workOpsExpenses.userId, TEMP_USER_ID),
        ),
      );

    return { success: true };
  });
