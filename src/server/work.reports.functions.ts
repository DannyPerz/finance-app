import { createServerFn } from "@tanstack/react-start";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import {
  workMembers,
  workPayrolls,
  workOpsExpenses,
  workPayrollParameters,
} from "../db/schema";
import { calculatePayrollCosts } from "../lib/payroll.utils";

const TEMP_USER_ID = "00000000-0000-0000-0000-000000000001";

export const getOpexExecutiveReport = createServerFn({ method: "GET" }).handler(
  async () => {
    // 1. Current Infra Run Rate
    const infraExpenses = await db.query.workOpsExpenses.findMany({
      where: and(
        eq(workOpsExpenses.userId, TEMP_USER_ID),
        eq(workOpsExpenses.isActive, "true"),
      ),
    });

    const currentInfraCost = infraExpenses.reduce((acc, expense) => {
      const amount = Number(expense.amount);
      return acc + (expense.billingCycle === "yearly" ? amount / 12 : amount);
    }, 0);

    // 2. Current Talent Run Rate
    const activeMembers = await db.query.workMembers.findMany({
      where: and(
        eq(workMembers.userId, TEMP_USER_ID),
        eq(workMembers.isActive, "true"),
      ),
    });

    const currentYear = new Date().getFullYear();
    const params = await db.query.workPayrollParameters.findFirst({
      where: and(
        eq(workPayrollParameters.userId, TEMP_USER_ID),
        eq(workPayrollParameters.year, String(currentYear)),
      ),
    });

    let currentTalentCost = 0;
    if (params) {
      currentTalentCost = activeMembers.reduce((acc, m) => {
        const costs = calculatePayrollCosts(
          Number(m.baseSalary),
          m.contractType,
          (m.arlLevel || "I") as any,
          params as any,
        );
        return acc + costs.totalEmployerCost;
      }, 0);
    }

    // 3. Historical Talent Costs from Payroll Snapshots
    const rawHistoricalPayrolls = await db.query.workPayrolls.findMany({
      where: eq(workPayrolls.userId, TEMP_USER_ID),
    });

    // Group dynamically
    const historyMap: Record<string, number> = {};
    for (const p of rawHistoricalPayrolls) {
      if (!historyMap[p.period]) {
        historyMap[p.period] = 0;
      }
      historyMap[p.period] += Number(p.employerCost || 0);
    }

    // Format for Recharts (Array sorted by period chronologically)
    const historicalData = Object.keys(historyMap)
      .sort() // e.g. "2026-01", "2026-02"
      .map((period) => ({
        period,
        talentCost: historyMap[period],
        infraCost: currentInfraCost, // Assuming infra cost applies retroactively for the chart simplicity since we don't snapshot infra yet
        totalOpex: historyMap[period] + currentInfraCost,
      }));

    return {
      currentRunRate: {
        infra: currentInfraCost,
        talent: currentTalentCost,
        total: currentInfraCost + currentTalentCost,
      },
      historicalData,
      infraBreakdown: infraExpenses.map((e) => ({
        name: e.name,
        category: e.category,
        normalizedMonthlyCost:
          e.billingCycle === "yearly"
            ? Number(e.amount) / 12
            : Number(e.amount),
      })),
      talentBreakdown: activeMembers.map((m) => ({
        name: m.name,
        role: m.role,
        contractType: m.contractType,
      })),
    };
  },
);
