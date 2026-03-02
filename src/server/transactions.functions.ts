import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { transactions, categories } from "@/db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { createTransactionSchema } from "./schemas";

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
      createdAt: transactions.createdAt,
      categoryName: categories.name,
      categoryIcon: categories.icon,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, TEMP_USER_ID))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(50);
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

// ─── Month Summary ───────────────────────────────────────

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

// ─── Expenses by Category (Pie Chart) ────────────────────

export const getExpensesByCategory = createServerFn().handler(async () => {
  const now = new Date();
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

  const result = await db
    .select({
      category: categories.name,
      total: sql<string>`COALESCE(SUM(${transactions.amount}::numeric), 0)::text`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, TEMP_USER_ID),
        eq(transactions.type, "expense"),
        gte(transactions.date, firstDay),
        lte(transactions.date, lastDay),
      ),
    )
    .groupBy(categories.name);

  return result.map((r) => ({
    category: r.category || "Sin categoría",
    total: parseFloat(r.total),
  }));
});

// ─── Monthly Trend (Bar Chart) ───────────────────────────

export const getMonthlyTrend = createServerFn().handler(async () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const startDate = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, "0")}-01`;

  const result = await db
    .select({
      month: sql<string>`TO_CHAR(${transactions.date}::date, 'YYYY-MM')`,
      type: transactions.type,
      total: sql<string>`COALESCE(SUM(${transactions.amount}::numeric), 0)::text`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, TEMP_USER_ID),
        gte(transactions.date, startDate),
      ),
    )
    .groupBy(
      sql`TO_CHAR(${transactions.date}::date, 'YYYY-MM')`,
      transactions.type,
    )
    .orderBy(sql`TO_CHAR(${transactions.date}::date, 'YYYY-MM')`);

  const monthMap = new Map<
    string,
    { month: string; income: number; expense: number }
  >();
  const monthLabels = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  for (const row of result) {
    if (!monthMap.has(row.month)) {
      const [, m] = row.month.split("-");
      monthMap.set(row.month, {
        month: monthLabels[parseInt(m) - 1],
        income: 0,
        expense: 0,
      });
    }
    const entry = monthMap.get(row.month)!;
    if (row.type === "income") entry.income = parseFloat(row.total);
    if (row.type === "expense") entry.expense = parseFloat(row.total);
  }

  return Array.from(monthMap.values());
});
