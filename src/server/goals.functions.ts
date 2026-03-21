import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { savingsGoals } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createGoalSchema,
  updateGoalSchema,
  contributeGoalSchema,
  deleteGoalSchema,
} from "./schemas";
import { getAuthUserId } from "./auth.utils";

// ─── List Goals ──────────────────────────────────────────

export const getGoals = createServerFn().handler(async () => {
  const userId = await getAuthUserId();
  return db
    .select()
    .from(savingsGoals)
    .where(eq(savingsGoals.userId, userId))
    .orderBy(savingsGoals.createdAt);
});

// ─── Create Goal ─────────────────────────────────────────

export const createGoal = createServerFn()
  .inputValidator(createGoalSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    await db.insert(savingsGoals).values({
      userId,
      name: data.name,
      icon: data.icon,
      targetAmount: data.targetAmount,
      deadline: data.deadline ?? null,
    });
  });

// ─── Update Goal ─────────────────────────────────────────

export const updateGoal = createServerFn()
  .inputValidator(updateGoalSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    await db
      .update(savingsGoals)
      .set({
        name: data.name,
        icon: data.icon,
        targetAmount: data.targetAmount,
        deadline: data.deadline ?? null,
      })
      .where(
        and(eq(savingsGoals.id, data.id), eq(savingsGoals.userId, userId)),
      );
  });

// ─── Contribute to Goal ──────────────────────────────────

export const contributeToGoal = createServerFn()
  .inputValidator(contributeGoalSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const [goal] = await db
      .select({ savedAmount: savingsGoals.savedAmount })
      .from(savingsGoals)
      .where(
        and(eq(savingsGoals.id, data.id), eq(savingsGoals.userId, userId)),
      );
    if (!goal) throw new Error("Meta no encontrada");

    const newSaved = (
      parseFloat(goal.savedAmount ?? "0") + parseFloat(data.amount)
    ).toFixed(2);

    await db
      .update(savingsGoals)
      .set({ savedAmount: newSaved })
      .where(
        and(eq(savingsGoals.id, data.id), eq(savingsGoals.userId, userId)),
      );
  });

// ─── Delete Goal ─────────────────────────────────────────

export const deleteGoal = createServerFn()
  .inputValidator(deleteGoalSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    await db
      .delete(savingsGoals)
      .where(
        and(eq(savingsGoals.id, data.id), eq(savingsGoals.userId, userId)),
      );
  });
