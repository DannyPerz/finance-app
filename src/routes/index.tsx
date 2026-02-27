import { createFileRoute, useRouter } from "@tanstack/react-router";
import TopBar from "@/components/TopBar";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Landmark,
  Zap,
} from "lucide-react";
import { getAccounts } from "@/server/accounts.functions";
import {
  getTransactions,
  getMonthSummary,
} from "@/server/transactions.functions";
import { getBudgets } from "@/server/budgets.functions";
import { getDebts } from "@/server/debts.functions";
import { getGoals } from "@/server/goals.functions";
import { seedDatabase } from "@/server/seed.functions";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [accounts, transactions, monthSummary, budgets, debts, goals] =
      await Promise.all([
        getAccounts(),
        getTransactions(),
        getMonthSummary(),
        getBudgets(),
        getDebts(),
        getGoals(),
      ]);
    return { accounts, transactions, monthSummary, budgets, debts, goals };
  },
  component: DashboardPage,
});

const formatCOP = (n: number | string) => {
  const num = typeof n === "string" ? parseFloat(n) : n;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(num);
};

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  color: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {trend && (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {trend}
            </p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

function DashboardPage() {
  const { accounts, transactions, monthSummary, budgets, debts, goals } =
    Route.useLoaderData();
  const router = useRouter();

  const netWorth = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);

  const income = parseFloat(monthSummary.income);
  const expense = parseFloat(monthSummary.expense);
  const budgetTotal = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const budgetPct =
    budgetTotal > 0 ? Math.round((expense / budgetTotal) * 100) : 0;

  const handleSeed = async () => {
    const result = await seedDatabase();
    alert(result.message);
    router.invalidate();
  };

  const isEmpty = accounts.length === 0;

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
          {/* Seed button when empty */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
              <Zap className="mb-4 h-12 w-12 text-emerald-500" />
              <h2 className="text-xl font-bold text-foreground">
                ¡Bienvenido a Finova!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tu base de datos está vacía. ¿Quieres cargar datos de
                demostración?
              </p>
              <button
                onClick={handleSeed}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <Zap className="h-4 w-4" />
                Cargar datos demo
              </button>
            </div>
          )}

          {!isEmpty && (
            <>
              {/* Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Patrimonio Neto"
                  value={formatCOP(netWorth)}
                  icon={Wallet}
                  color="bg-gradient-to-br from-emerald-500 to-teal-600"
                />
                <StatCard
                  title="Ingresos del Mes"
                  value={formatCOP(income)}
                  icon={TrendingUp}
                  color="bg-gradient-to-br from-blue-500 to-indigo-600"
                />
                <StatCard
                  title="Gastos del Mes"
                  value={formatCOP(expense)}
                  icon={TrendingDown}
                  trend={
                    budgetTotal > 0
                      ? `${budgetPct}% del presupuesto`
                      : undefined
                  }
                  color="bg-gradient-to-br from-orange-500 to-red-500"
                />
                <StatCard
                  title="Metas Activas"
                  value={String(goals.length)}
                  icon={Target}
                  color="bg-gradient-to-br from-purple-500 to-pink-500"
                />
              </div>

              {/* Grid: Transactions + Side cards */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Transactions */}
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h2 className="text-base font-semibold text-foreground">
                      Transacciones Recientes
                    </h2>
                  </div>
                  <div className="divide-y divide-border">
                    {transactions.slice(0, 6).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                              tx.type === "expense"
                                ? "bg-red-100 dark:bg-red-900/30"
                                : tx.type === "income"
                                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                                  : "bg-blue-100 dark:bg-blue-900/30"
                            }`}
                          >
                            {tx.type === "expense" ? (
                              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                            ) : (
                              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {tx.description || "Sin descripción"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tx.categoryName || "Sin categoría"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-semibold ${
                              tx.type === "expense"
                                ? "text-red-600 dark:text-red-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {tx.type === "expense" ? "-" : "+"}
                            {formatCOP(tx.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.date}
                          </p>
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                        No hay transacciones aún
                      </p>
                    )}
                  </div>
                </div>

                {/* Sidebar cards */}
                <div className="space-y-4">
                  {/* Budget Overview */}
                  {budgets.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <h3 className="mb-4 text-base font-semibold text-foreground">
                        Presupuesto del Mes
                      </h3>
                      <div className="space-y-3">
                        {budgets.slice(0, 4).map((b) => {
                          const spent = parseFloat(b.spent || "0");
                          const limit = parseFloat(b.amount);
                          const pct =
                            limit > 0 ? Math.round((spent / limit) * 100) : 0;
                          return (
                            <div key={b.id} className="space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="font-medium text-foreground">
                                  {b.categoryName}
                                </span>
                                <span
                                  className={`font-semibold ${
                                    pct >= 90
                                      ? "text-red-500"
                                      : pct >= 70
                                        ? "text-amber-500"
                                        : "text-emerald-600 dark:text-emerald-400"
                                  }`}
                                >
                                  {pct}%
                                </span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    pct >= 90
                                      ? "bg-red-500"
                                      : pct >= 70
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(pct, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Debts */}
                  {debts.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <div className="mb-3 flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-base font-semibold text-foreground">
                          Deudas Activas
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {debts.map((d) => {
                          const progress = Math.round(
                            (d.paidInstallments / d.totalInstallments) * 100,
                          );
                          return (
                            <div
                              key={d.id}
                              className="rounded-lg bg-muted/50 px-3 py-2.5"
                            >
                              <div className="flex justify-between text-xs">
                                <span className="font-medium text-foreground">
                                  {d.name}
                                </span>
                                <span className="text-muted-foreground">
                                  {formatCOP(d.remainingBalance)}
                                </span>
                              </div>
                              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Goals */}
                  {goals.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <div className="mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-base font-semibold text-foreground">
                          Metas
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {goals.map((g) => {
                          const progress = Math.round(
                            (parseFloat(g.currentAmount) /
                              parseFloat(g.targetAmount)) *
                              100,
                          );
                          return (
                            <div
                              key={g.id}
                              className="rounded-lg bg-muted/50 px-3 py-2.5"
                            >
                              <div className="flex justify-between text-xs">
                                <span className="font-medium text-foreground">
                                  {g.name}
                                </span>
                                <span className="text-muted-foreground">
                                  {formatCOP(g.currentAmount)} /{" "}
                                  {formatCOP(g.targetAmount)}
                                </span>
                              </div>
                              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-purple-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
