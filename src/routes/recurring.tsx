import { createFileRoute } from "@tanstack/react-router";
import TopBar from "@/components/TopBar";
import { Plus, PiggyBank, Pause, Play } from "lucide-react";
import { getRecurringTransactions } from "@/server/recurring.functions";

export const Route = createFileRoute("/recurring")({
  loader: () => getRecurringTransactions(),
  component: RecurringPage,
});

const formatCOP = (n: string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(parseFloat(n));

const frequencyLabels: Record<string, string> = {
  daily: "Diario",
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
  yearly: "Anual",
};

function RecurringPage() {
  const recurring = Route.useLoaderData();

  return (
    <>
      <TopBar title="Transacciones Recurrentes" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Suscripciones, servicios y pagos automáticos
            </p>
            <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Nuevo Recurrente
            </button>
          </div>

          {recurring.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
              <PiggyBank className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No tienes transacciones recurrentes
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="divide-y divide-border">
                {recurring.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/50 ${!item.isActive ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          item.type === "income"
                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                            : "bg-orange-100 dark:bg-orange-900/30"
                        }`}
                      >
                        <PiggyBank
                          className={`h-5 w-5 ${
                            item.type === "income"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-orange-600 dark:text-orange-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.description || "Sin descripción"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {frequencyLabels[item.frequency] || item.frequency} •
                          Próximo: {item.nextDate} • {item.accountName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={`text-sm font-semibold ${
                          item.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-foreground"
                        }`}
                      >
                        {item.type === "income" ? "+" : "-"}
                        {formatCOP(item.amount)}
                      </p>
                      <button
                        className={`rounded-lg p-1.5 transition-colors ${
                          item.isActive
                            ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                            : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        }`}
                      >
                        {item.isActive ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
