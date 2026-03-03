import { createServerFn } from "@tanstack/react-start";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { workMembers } from "../db/schema";
import { createWorkMemberSchema } from "./schemas";

const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

// ─── List Work Members ───────────────────────────────────

export const getWorkMembers = createServerFn().handler(async () => {
  const members = await db
    .select()
    .from(workMembers)
    .where(eq(workMembers.userId, TEMP_USER_ID))
    .orderBy(desc(workMembers.createdAt));

  return members.map((m) => ({
    ...m,
    startDate: m.startDate
      ? new Date(m.startDate).toISOString().split("T")[0]
      : "",
  }));
});

// ─── Create Work Member ──────────────────────────────────

export const createWorkMember = createServerFn({ method: "POST" })
  .inputValidator(createWorkMemberSchema)
  .handler(async ({ data }) => {
    const [member] = await db
      .insert(workMembers)
      .values({ ...data, userId: TEMP_USER_ID })
      .returning();

    return member;
  });
