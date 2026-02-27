import { createFileRoute } from "@tanstack/react-router";
import TopBar from "@/components/TopBar";
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { getTransactions } from "@/server/transactions.functions";

export const Route = createFileRoute("/transactions")({
  loader: () => getTransactions(),
  component: TransactionsPage,
});

const formatCOP = (n: string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(parseFloat(n));

function TransactionsPage() {
  const transactions = Route.useLoaderData();

  const iconMap = {
    income: TrendingUp,
    expense: TrendingDown,
    transfer: ArrowLeftRight,
  };
  const colorMap = {
    income:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
    expense: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
    transfer:
      "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  };

  return (
    <>
      <TopBar title="Transacciones" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Historial de movimientos financieros
            </p>
            <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Nueva Transacción
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
              <ArrowLeftRight className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No hay transacciones registradas
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="divide-y divide-border">
                {transactions.map((tx) => {
                  const txType = tx.type as keyof typeof iconMap;
                  const Icon = iconMap[txType];
                  const colors = colorMap[txType];
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {tx.description || "Sin descripción"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.categoryName || "Sin categoría"} •{" "}
                            {tx.accountName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            tx.type === "expense"
                              ? "text-red-600 dark:text-red-400"
                              : tx.type === "income"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {tx.type === "expense"
                            ? "-"
                            : tx.type === "income"
                              ? "+"
                              : ""}
                          {formatCOP(tx.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.date}
                        </p>
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
  );
}
