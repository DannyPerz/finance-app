import { createFileRoute } from "@tanstack/react-router";
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
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Recurrentes</h1>
          <p className="text-muted-foreground">
            Suscripciones y pagos automáticos.
          </p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          + Nuevo Recurrente
        </button>
      </div>

      {recurring.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center border-dashed">
          <p className="text-muted-foreground">
            No tienes transacciones recurrentes.
          </p>
        </div>
      ) : (
        <div className="glass rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            {recurring.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between py-2 border-b border-border/50 last:border-0 ${!item.isActive ? "opacity-40" : ""}`}
              >
                <div>
                  <p className="font-medium">
                    {item.description || "Sin descripción"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {frequencyLabels[item.frequency] || item.frequency} •
                    Próximo: {item.nextDate} • {item.accountName}
                  </p>
                </div>
                <div
                  className={`font-semibold ${item.type === "income" ? "text-primary" : ""}`}
                >
                  {item.type === "income" ? "+" : "-"}
                  {formatCOP(item.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
