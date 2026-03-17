import { createServerFn } from "@tanstack/react-start";
import { eq, desc, and } from "drizzle-orm";
import { db } from "../db";
import { workMembers } from "../db/schema";
import {
  createWorkMemberSchema,
  updateWorkMemberSchema,
  softDeleteWorkMemberSchema,
} from "./schemas";

import { getAuthUserId } from "./auth.utils";

// ─── List Work Members ───────────────────────────────────

export const getWorkMembers = createServerFn().handler(async () => {
  const userId = await getAuthUserId();
  const members = await db
    .select()
    .from(workMembers)
    .where(eq(workMembers.userId, userId))
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
    const userId = await getAuthUserId();
    const [member] = await db
      .insert(workMembers)
      .values({ ...data, userId })
      .returning();

    return member;
  });

// ─── Update Work Member ──────────────────────────────────

export const updateWorkMember = createServerFn({ method: "POST" })
  .inputValidator(updateWorkMemberSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const { id, ...updateData } = data;
    const [updated] = await db
      .update(workMembers)
      .set({
        ...updateData,
        endDate: updateData.endDate || null,
        updatedAt: new Date(),
      })
      .where(and(eq(workMembers.id, id), eq(workMembers.userId, userId)))
      .returning();

    return updated;
  });

// ─── Soft Delete Work Member ─────────────────────────────

export const deleteWorkMember = createServerFn({ method: "POST" })
  .inputValidator(softDeleteWorkMemberSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const [deactivated] = await db
      .update(workMembers)
      .set({
        isActive: "false",
        endDate: data.endDate,
        updatedAt: new Date(),
      })
      .where(
        and(eq(workMembers.id, data.id), eq(workMembers.userId, userId)),
      )
      .returning();

    return deactivated;
  });
