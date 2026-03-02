import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import {
  getTransactions,
  getMonthSummary,
  getExpensesByCategory,
  getMonthlyTrend,
} from "@/server/transactions.functions";
import { resetAndSeed } from "@/server/seed.functions";
import { ExpensesPieChart } from "@/components/charts/ExpensesPieChart";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [transactions, monthSummary, expensesByCategory, monthlyTrend] =
      await Promise.all([
        getTransactions(),
        getMonthSummary(),
        getExpensesByCategory(),
        getMonthlyTrend(),
      ]);
    return { transactions, monthSummary, expensesByCategory, monthlyTrend };
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
  const { transactions, monthSummary, expensesByCategory, monthlyTrend } =
    Route.useLoaderData();
  const router = useRouter();

  const income = parseFloat(monthSummary.income);
  const expense = parseFloat(monthSummary.expense);
  const balance = income - expense;
  const isEmpty = transactions.length === 0;

  const handleSeed = async () => {
    const result = await resetAndSeed();
    alert(result.message);
    router.invalidate();
  };

  const now = new Date();
  const monthLabels = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

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
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {monthLabels[now.getMonth()]} {now.getFullYear()}
          </p>
        </div>
        <button
          onClick={handleSeed}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          🔄 Re-seed
        </button>
      </div>

      {/* Metric Row */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <div className="glass rounded-xl p-5 sm:p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Ingresos
          </h3>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-primary">
            {formatCOP(income)}
          </div>
        </div>
        <div className="glass rounded-xl p-5 sm:p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Gastos</h3>
          <div className="mt-2 text-2xl sm:text-3xl font-bold">
            {formatCOP(expense)}
          </div>
        </div>
        <div
          className={`glass rounded-xl p-5 sm:p-6 shadow-sm border ${balance >= 0 ? "border-primary/20 bg-linear-to-br from-background to-primary/5" : "border-destructive/20 bg-linear-to-br from-background to-destructive/5"}`}
        >
          <h3 className="text-sm font-medium text-muted-foreground">Balance</h3>
          <div
            className={`mt-2 text-2xl sm:text-3xl font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}
          >
            {balance >= 0 ? "+" : ""}
            {formatCOP(balance)}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="glass rounded-xl p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Ingresos vs Gastos
          </h2>
          <MonthlyTrendChart data={monthlyTrend} />
        </div>
        <div className="glass rounded-xl p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Gastos por Categoría
          </h2>
          <ExpensesPieChart data={expensesByCategory} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass rounded-xl p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-3">
          {transactions.slice(0, 8).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                  <Icon
                    name={tx.categoryIcon || "Circle"}
                    size={16}
                    className="text-muted-foreground"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {tx.description || "Sin descripción"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.categoryName || "Sin categoría"} • {tx.date}
                  </p>
                </div>
              </div>
              <div
                className={`font-semibold shrink-0 ml-3 ${tx.type === "income" ? "text-primary" : ""}`}
              >
                {tx.type === "income" ? "+" : "-"}
                {formatCOP(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
