import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { debts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createDebtSchema } from "./schemas";

const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

export const getDebts = createServerFn().handler(async () => {
  const result = await db
    .select()
    .from(debts)
    .where(eq(debts.userId, TEMP_USER_ID))
    .orderBy(desc(debts.createdAt));
  return result;
});

export const createDebt = createServerFn({ method: "POST" })
  .inputValidator(createDebtSchema)
  .handler(async ({ data }) => {
    const [newDebt] = await db
      .insert(debts)
      .values({
        userId: TEMP_USER_ID,
        name: data.name,
        principal: data.principal,
        interestRate: data.interestRate,
        totalInstallments: data.totalInstallments,
        paidInstallments: data.paidInstallments,
        monthlyPayment: data.monthlyPayment,
        remainingBalance: data.remainingBalance,
      })
      .returning();
    return newDebt;
  });
