import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { budgets, categories } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { createBudgetSchema } from "./schemas";

const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

export const getBudgets = createServerFn().handler(async () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;

  const result = await db
    .select({
      id: budgets.id,
      amount: budgets.amount,
      month: budgets.month,
      year: budgets.year,
      categoryId: budgets.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      spent: sql<string>`COALESCE((
        SELECT SUM(t.amount::numeric)
        FROM transactions t
        WHERE t.category_id = ${budgets.categoryId}
          AND t.user_id = ${TEMP_USER_ID}
          AND t.type = 'expense'
          AND t.date >= ${firstDay}
          AND t.date <= ${lastDay}
      ), 0)::text`,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(
      and(
        eq(budgets.userId, TEMP_USER_ID),
        eq(budgets.month, month),
        eq(budgets.year, year),
      ),
    );

  return result;
});

export const createBudget = createServerFn({ method: "POST" })
  .inputValidator(createBudgetSchema)
  .handler(async ({ data }) => {
    const [newBudget] = await db
      .insert(budgets)
      .values({
        userId: TEMP_USER_ID,
        categoryId: data.categoryId,
        amount: data.amount,
        month: data.month,
        year: data.year,
      })
      .returning();
    return newBudget;
  });
