import { createServerFn } from "@tanstack/react-start";
import { db } from "#/db";
import { savingsChallenges } from "#/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createChallengeSchema,
  toggleChallengeDaySchema,
  deleteChallengeSchema,
  resetChallengeSchema,
} from "./schemas";
import { getAuthUserId } from "./auth.utils";

// ─── Get Challenge ───────────────────────────────────────

export const getChallenge = createServerFn().handler(async () => {
  const userId = await getAuthUserId();
  const [challenge] = await db
    .select()
    .from(savingsChallenges)
    .where(eq(savingsChallenges.userId, userId))
    .limit(1);
  return challenge ?? null;
});

// ─── Create Challenge ────────────────────────────────────

export const createChallenge = createServerFn({ method: "POST" })
  .inputValidator(createChallengeSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const [challenge] = await db
      .insert(savingsChallenges)
      .values({ userId, name: data.name, startDate: data.startDate, paidDays: [] })
      .returning();
    return challenge;
  });

// ─── Toggle Day ──────────────────────────────────────────

export const toggleChallengeDay = createServerFn({ method: "POST" })
  .inputValidator(toggleChallengeDaySchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const [current] = await db
      .select()
      .from(savingsChallenges)
      .where(
        and(
          eq(savingsChallenges.id, data.id),
          eq(savingsChallenges.userId, userId),
        ),
      );
    if (!current) throw new Error("Reto no encontrado");

    const newPaidDays = data.paid
      ? [...new Set([...current.paidDays, data.day])]
      : current.paidDays.filter((d) => d !== data.day);

    const [updated] = await db
      .update(savingsChallenges)
      .set({ paidDays: newPaidDays })
      .where(
        and(
          eq(savingsChallenges.id, data.id),
          eq(savingsChallenges.userId, userId),
        ),
      )
      .returning();
    return updated;
  });

// ─── Reset Challenge ─────────────────────────────────────

export const resetChallenge = createServerFn({ method: "POST" })
  .inputValidator(resetChallengeSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const [updated] = await db
      .update(savingsChallenges)
      .set({ paidDays: [] })
      .where(
        and(
          eq(savingsChallenges.id, data.id),
          eq(savingsChallenges.userId, userId),
        ),
      )
      .returning();
    return updated;
  });

// ─── Delete Challenge ────────────────────────────────────

export const deleteChallenge = createServerFn({ method: "POST" })
  .inputValidator(deleteChallengeSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    await db
      .delete(savingsChallenges)
      .where(
        and(
          eq(savingsChallenges.id, data.id),
          eq(savingsChallenges.userId, userId),
        ),
      );
    return { success: true };
  });
