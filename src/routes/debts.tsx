import { createFileRoute } from "@tanstack/react-router";
import TopBar from "@/components/TopBar";
import { Plus, Landmark } from "lucide-react";
import { getDebts } from "@/server/debts.functions";

export const Route = createFileRoute("/debts")({
  loader: () => getDebts(),
  component: DebtsPage,
});

const formatCOP = (n: string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(parseFloat(n));

function DebtsPage() {
  const debts = Route.useLoaderData();

  return (
    <>
      <TopBar title="Deudas y Amortización" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Seguimiento de deudas con cronograma de amortización
            </p>
            <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Nueva Deuda
            </button>
          </div>

          {debts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
              <Landmark className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                ¡No tienes deudas! 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {debts.map((debt) => {
                const progress = Math.round(
                  (debt.paidInstallments / debt.totalInstallments) * 100,
                );
                const remainingMonths =
                  debt.totalInstallments - debt.paidInstallments;

                return (
                  <div
                    key={debt.id}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                          <Landmark className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {debt.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Tasa: {debt.interestRate}% mensual •{" "}
                            {remainingMonths} cuotas restantes
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {progress}% pagado
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">
                          Monto Original
                        </p>
                        <p className="mt-1 text-lg font-bold text-foreground">
                          {formatCOP(debt.principal)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">
                          Saldo Restante
                        </p>
                        <p className="mt-1 text-lg font-bold text-red-600 dark:text-red-400">
                          {formatCOP(debt.remainingBalance)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">
                          Cuota Mensual
                        </p>
                        <p className="mt-1 text-lg font-bold text-foreground">
                          {formatCOP(debt.monthlyPayment)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                        <span>
                          {debt.paidInstallments} de {debt.totalInstallments}{" "}
                          cuotas
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                          style={{ width: `${progress}%` }}
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
