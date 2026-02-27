import { createFileRoute } from "@tanstack/react-router";
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
  }).format(Number(n));

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
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Presupuestos</h1>
          <p className="text-muted-foreground">
            {monthNames[now.getMonth()]} {now.getFullYear()}
          </p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          + Nuevo Presupuesto
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center border-dashed">
          <p className="text-muted-foreground">
            No hay presupuestos para este mes.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {budgets.map((b) => {
            const spent = parseFloat(b.spent || "0");
            const limit = parseFloat(b.amount);
            const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
            const remaining = limit - spent;

            return (
              <div key={b.id} className="glass rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{b.categoryName}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {remaining >= 0
                        ? `${formatCOP(remaining)} disponible`
                        : `${formatCOP(Math.abs(remaining))} excedido`}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${pct >= 90 ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{formatCOP(spent)}</span>
                    <span>{formatCOP(limit)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-destructive" : "bg-primary"}`}
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
  );
}
