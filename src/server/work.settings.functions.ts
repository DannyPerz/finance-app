import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { workPayrollParameters } from "../db/schema";
import { updatePayrollParametersSchema } from "./schemas";

import { getAuthUserId } from "./auth.utils";

// ─── Get Payroll Parameters for Year ──────────────────────

export const getPayrollParameters = createServerFn({ method: "GET" })
  .inputValidator(z.object({ year: z.number() }))
  .handler(async ({ data: { year } }) => {
    const userId = await getAuthUserId();
    let settings = await db.query.workPayrollParameters.findFirst({
      where: and(
        eq(workPayrollParameters.userId, userId),
        eq(workPayrollParameters.year, String(year)),
      ),
    });

    if (!settings) {
      // Seed default values for the year if it doesn't exist
      const [newSettings] = await db
        .insert(workPayrollParameters)
        .values({
          userId,
          year: String(year),
          // Using default DB values for the rest
        })
        .returning();
      settings = newSettings;
    }

    return settings;
  });

// ─── Update Payroll Parameters ────────────────────────────

export const updatePayrollParameters = createServerFn({ method: "POST" })
  .inputValidator(updatePayrollParametersSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const { year, ...updates } = data;

    const [updated] = await db
      .update(workPayrollParameters)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workPayrollParameters.userId, userId),
          eq(workPayrollParameters.year, String(year)),
        ),
      )
      .returning();

    return updated;
  });
