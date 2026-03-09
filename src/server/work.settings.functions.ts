import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { workPayrollParameters } from "../db/schema";
import { updatePayrollParametersSchema } from "./schemas";

const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

// ─── Get Payroll Parameters for Year ──────────────────────

export const getPayrollParameters = createServerFn({ method: "GET" })
  .inputValidator(z.object({ year: z.number() }))
  .handler(async ({ data }) => {
    let settings = await db.query.workPayrollParameters.findFirst({
      where: and(
        eq(workPayrollParameters.userId, TEMP_USER_ID),
        eq(workPayrollParameters.year, String(data.year)),
      ),
    });

    if (!settings) {
      // Seed default values for the year if it doesn't exist
      const [newSettings] = await db
        .insert(workPayrollParameters)
        .values({
          userId: TEMP_USER_ID,
          year: String(data.year),
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
    const { year, ...updates } = data;

    const [updated] = await db
      .update(workPayrollParameters)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workPayrollParameters.userId, TEMP_USER_ID),
          eq(workPayrollParameters.year, String(year)),
        ),
      )
      .returning();

    return updated;
  });
