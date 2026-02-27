import { createFileRoute } from "@tanstack/react-router";
import TopBar from "@/components/TopBar";
import { Plus, Receipt } from "lucide-react";
import { getBudgets } from "@/server/budgets.functions";

export const Route = createFileRoute("/budgets")({
  loader: () => getBudgets(),
  component: BudgetsPage,
});

const formatCOP = (n: string | number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(typeof n === "string" ? parseFloat(n) : n);

function BudgetsPage() {
  const budgets = Route.useLoaderData();
  const now = new Date();
  const monthNames = [
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

  return (
    <>
      <TopBar title="Presupuestos" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Controla tus límites de gasto por categoría —{" "}
              {monthNames[now.getMonth()]} {now.getFullYear()}
            </p>
            <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Nuevo Presupuesto
            </button>
          </div>

          {budgets.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
              <Receipt className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No hay presupuestos para este mes
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {budgets.map((b) => {
                const spent = parseFloat(b.spent || "0");
                const limit = parseFloat(b.amount);
                const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
                const remaining = limit - spent;

                return (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
                          📊
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {b.categoryName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {remaining >= 0
                              ? `${formatCOP(remaining)} disponible`
                              : `${formatCOP(Math.abs(remaining))} excedido`}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          pct >= 100
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : pct >= 80
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                        <span>{formatCOP(spent)}</span>
                        <span>{formatCOP(limit)}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 100
                              ? "bg-red-500"
                              : pct >= 80
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
