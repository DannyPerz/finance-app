import { createServerFn } from "@tanstack/react-start";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { workMembers, workPayrolls, workPayrollParameters } from "../db/schema";
import { calculatePayrollCosts, type ArlLevel, type PayrollParameters } from "../lib/payroll.utils";
import { getPayrollParameters } from "./work.settings.functions";

import { getAuthUserId } from "./auth.utils";

// ─── Get All Payrolls ────────────────────────────────────

export const getPayrolls = createServerFn().handler(async () => {
  const userId = await getAuthUserId();
  const allPayrolls = await db
    .select({
      payroll: workPayrolls,
      member: {
        name: workMembers.name,
        role: workMembers.role,
        contractType: workMembers.contractType,
      },
    })
    .from(workPayrolls)
    .innerJoin(workMembers, eq(workPayrolls.memberId, workMembers.id))
    .where(eq(workPayrolls.userId, userId));

  return allPayrolls;
});

// ─── Generate Monthly Payroll ────────────────────────────

export const generateMonthlyPayrollSchema = z.object({
  period: z.string().min(7).max(7), // "YYYY-MM" format
});

export const generateMonthlyPayroll = createServerFn({ method: "POST" })
  .inputValidator(generateMonthlyPayrollSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    // 0. Extract year from period
    const year = parseInt(data.period.split("-")[0], 10);
    // Fetch the specific parameters for this year directly since this is a server function calling another server function's inner logic
    let params = await db.query.workPayrollParameters.findFirst({
      where: and(
        eq(workPayrollParameters.userId, userId),
        eq(workPayrollParameters.year, String(year)),
      ),
    });

    if (!params) {
      // Fallback or seed if none found
      params = await getPayrollParameters({ data: { year } });
    }

    // 1. Fetch all active members
    const activeMembers = await db
      .select()
      .from(workMembers)
      .where(
        and(
          eq(workMembers.userId, userId),
          eq(workMembers.isActive, "true"),
        ),
      );

    if (activeMembers.length === 0) {
      throw new Error("No hay empleados activos para liquidar la nómina.");
    }

    // 2. Check if payroll for this period already exists for these users to prevent double processing
    // Optionally delete existing 'pending' payrolls for this period, or just skip.
    // We'll trust the user isn't clicking it twice, or we can just delete previous ones.
    await db
      .delete(workPayrolls)
      .where(
        and(
          eq(workPayrolls.period, data.period),
          eq(workPayrolls.userId, userId),
          eq(workPayrolls.status, "pending"),
        ),
      );

    // 3. Calculate and insert rows
    const inserts = activeMembers.map((m) => {
      const costs = calculatePayrollCosts(
        Number(m.baseSalary),
        m.contractType,
        ((m.arlLevel || "I") as ArlLevel),
        params as PayrollParameters,
      );

      return {
        userId: userId,
        memberId: m.id,
        period: data.period,
        grossSalary: costs.baseSalary.toString(),
        deductions: costs.employeeDeductions.total.toString(),
        bonuses: "0", // Could be dynamic in the future
        netPaid: costs.netSalaryToPay.toString(),
        employerCost: costs.totalEmployerCost.toString(),
        status: "pending", // Unpaid default
        notes: `Generado automáticamente.`,
      };
    });

    await db.insert(workPayrolls).values(inserts);

    return { success: true, count: inserts.length };
  });

// ─── Mark Payroll as Paid ────────────────────────────────

export const markPayrollAsPaidSchema = z.object({
  payrollId: z.string().uuid(),
});

export const markPayrollAsPaid = createServerFn({ method: "POST" })
  .inputValidator(markPayrollAsPaidSchema)
  .handler(async ({ data }) => {
    const userId = await getAuthUserId();
    const [updated] = await db
      .update(workPayrolls)
      .set({
        status: "paid",
        paymentDate: new Date().toISOString().split("T")[0],
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workPayrolls.id, data.payrollId),
          eq(workPayrolls.userId, userId),
        ),
      )
      .returning();

    return updated;
  });
