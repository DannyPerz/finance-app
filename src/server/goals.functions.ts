import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createGoalSchema } from "./schemas";

const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

export const getGoals = createServerFn().handler(async () => {
  const result = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, TEMP_USER_ID))
    .orderBy(desc(goals.createdAt));
  return result;
});

export const createGoal = createServerFn({ method: "POST" })
  .inputValidator(createGoalSchema)
  .handler(async ({ data }) => {
    const [newGoal] = await db
      .insert(goals)
      .values({
        userId: TEMP_USER_ID,
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount,
        deadline: data.deadline,
      })
      .returning();
    return newGoal;
  });
