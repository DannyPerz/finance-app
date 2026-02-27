import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createAccountSchema } from "./schemas";

// Hardcoded user ID until auth is implemented
const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

export const getAccounts = createServerFn().handler(async () => {
  const result = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, TEMP_USER_ID))
    .orderBy(desc(accounts.createdAt));
  return result;
});

export const createAccount = createServerFn({ method: "POST" })
  .inputValidator(createAccountSchema)
  .handler(async ({ data }) => {
    const [newAccount] = await db
      .insert(accounts)
      .values({
        userId: TEMP_USER_ID,
        name: data.name,
        type: data.type,
        currency: data.currency,
        balance: data.balance,
      })
      .returning();
    return newAccount;
  });
