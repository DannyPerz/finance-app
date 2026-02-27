import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getAccounts } from "@/server/accounts.functions";
import {
  getTransactions,
  getMonthSummary,
  getExpensesByCategory,
  getMonthlyTrend,
} from "@/server/transactions.functions";
import { getBudgets } from "@/server/budgets.functions";
import { getDebts } from "@/server/debts.functions";
import { getGoals } from "@/server/goals.functions";
import { resetAndSeed } from "@/server/seed.functions";
import { ExpensesPieChart } from "@/components/charts/ExpensesPieChart";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [
      accounts,
      transactions,
      monthSummary,
      budgets,
      debts,
      goals,
      expensesByCategory,
      monthlyTrend,
    ] = await Promise.all([
      getAccounts(),
      getTransactions(),
      getMonthSummary(),
      getBudgets(),
      getDebts(),
      getGoals(),
      getExpensesByCategory(),
      getMonthlyTrend(),
    ]);
    return {
      accounts,
      transactions,
      monthSummary,
      budgets,
      debts,
      goals,
      expensesByCategory,
      monthlyTrend,
    };
  },
  component: Dashboard,
});

const formatCOP = (n: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n));

function Dashboard() {
  const {
    accounts,
    transactions,
    monthSummary,
    budgets,
    debts,
    goals,
    expensesByCategory,
    monthlyTrend,
  } = Route.useLoaderData();
  const router = useRouter();

  const netWorth = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);
  const income = parseFloat(monthSummary.income);
  const expense = parseFloat(monthSummary.expense);
  const isEmpty = accounts.length === 0;

  const handleSeed = async () => {
    const result = await resetAndSeed();
    alert(result.message);
    router.invalidate();
  };

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Tu resumen financiero en tiempo real.
          </p>
        </div>
        <div className="glass rounded-xl p-10 text-center">
          <h2 className="text-xl font-semibold">¡Bienvenido a Finova!</h2>
          <p className="mt-2 text-muted-foreground">
            Tu base de datos está vacía.
          </p>
          <button
            onClick={handleSeed}
            className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Cargar datos demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Tu resumen financiero en tiempo real.
        </p>
      </div>

      {/* Metric Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass rounded-xl p-6 shadow-sm border border-primary/20 bg-linear-to-br from-background to-primary/5">
          <h3 className="text-sm font-medium text-muted-foreground">
            Patrimonio Neto
          </h3>
          <div className="mt-2 text-3xl font-bold text-primary">
            {formatCOP(netWorth)}
          </div>
          <p className="mt-1 text-xs text-primary/80">Todas las cuentas</p>
        </div>
        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Ingresos del Mes
          </h3>
          <div className="mt-2 text-3xl font-bold">{formatCOP(income)}</div>
          <p className="mt-1 text-xs text-muted-foreground">Febrero 2026</p>
        </div>
        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Gastos del Mes
          </h3>
          <div className="mt-2 text-3xl font-bold">{formatCOP(expense)}</div>
          <p className="mt-1 text-xs text-muted-foreground">Febrero 2026</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 mt-2">
        <div className="glass rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Ingresos vs Gastos</h2>
          <MonthlyTrendChart data={monthlyTrend} />
        </div>
        <div className="glass rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Gastos por Categoría</h2>
          <ExpensesPieChart data={expensesByCategory} />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mt-2">
        {/* Recent Transactions */}
        <div className="glass rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            {transactions.slice(0, 6).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="font-medium">
                    {tx.description || "Sin descripción"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.categoryName || "Sin categoría"} • {tx.date}
                  </p>
                </div>
                <div
                  className={`font-semibold ${tx.type === "income" ? "text-primary" : ""}`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCOP(tx.amount)}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-xs text-muted-foreground mt-4">
                Sin actividad reciente.
              </p>
            )}
          </div>
        </div>

        {/* Side info */}
        <div className="space-y-6">
          {/* Budget summary */}
          {budgets.length > 0 && (
            <div className="glass rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Presupuestos</h2>
              <div className="space-y-3">
                {budgets.slice(0, 4).map((b) => {
                  const spent = parseFloat(b.spent || "0");
                  const limit = parseFloat(b.amount);
                  const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
                  return (
                    <div key={b.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{b.categoryName}</span>
                        <span className="text-muted-foreground">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-destructive" : "bg-primary"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Goals + Debts summary */}
          {(debts.length > 0 || goals.length > 0) && (
            <div className="glass rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Metas y Deudas</h2>
              <div className="space-y-3">
                {goals.map((g) => {
                  const pct = Math.round(
                    (parseFloat(g.currentAmount) / parseFloat(g.targetAmount)) *
                      100,
                  );
                  return (
                    <div
                      key={g.id}
                      className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0"
                    >
                      <span className="text-sm">{g.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {pct}% — {formatCOP(g.currentAmount)}
                      </span>
                    </div>
                  );
                })}
                {debts.map((d) => {
                  const pct = Math.round(
                    (d.paidInstallments / d.totalInstallments) * 100,
                  );
                  return (
                    <div
                      key={d.id}
                      className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0"
                    >
                      <span className="text-sm">{d.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {pct}% pagado — {formatCOP(d.remainingBalance)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
