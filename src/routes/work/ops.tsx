import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getOpsExpenses } from "@/server/work.ops.functions";
import { Server, Grid, Activity } from "lucide-react";
import { formatWithDots } from "@/lib/utils";
import { CreateOpsExpenseModal } from "@/components/modals/CreateOpsExpenseModal";

export const Route = createFileRoute("/work/ops")({
  loader: async () => getOpsExpenses(),
  component: OpsDashboard,
});

const formatCOP = (n: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n));

function OpsDashboard() {
  const expenses = Route.useLoaderData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<any>(null);

  // Calculate Monthly Run Rate
  const monthlyRunRate = expenses.reduce((acc, expense) => {
    if (expense.isActive !== "true") return acc;
    const amount = Number(expense.amount);
    return acc + (expense.billingCycle === "yearly" ? amount / 12 : amount);
  }, 0);

  // Group by Category
  const byCategory = expenses.reduce(
    (acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = [];
      acc[curr.category].push(curr);
      return acc;
    },
    {} as Record<string, typeof expenses>,
  );

  return (
    <div className="space-y-6 flex-1 w-full h-full pb-20">
      {/* Header and Call to Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Infraestructura y Operaciones
          </h1>
          <p className="text-muted-foreground">
            Control de gastos recurrentes en SaaS, Cloud y DevTools.
          </p>
        </div>
        <button
          onClick={() => {
            setExpenseToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 active:scale-[0.98]"
        >
          <Server size={18} />
          Añadir Gasto
        </button>
      </div>

      {/* Hero Metric */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass flex flex-col justify-between rounded-2xl p-6 shadow-sm border border-border bg-gradient-to-br from-orange-500/10 to-orange-500/5 relative overflow-hidden h-full">
          <div className="absolute -right-6 -top-6 text-orange-500/20">
            <Server size={120} />
          </div>
          <div className="relative z-10 flex items-center justify-between mb-2">
            <h2 className="font-semibold text-orange-800 dark:text-orange-400">
              Run Rate Mensualizado
            </h2>
            <div className="flex items-center justify-center rounded-xl bg-orange-100 p-2 text-orange-600 dark:bg-orange-500/20">
              <Activity size={20} />
            </div>
          </div>
          <p className="relative z-10 text-3xl sm:text-4xl font-bold text-orange-900 dark:text-orange-100 mt-2">
            {formatCOP(monthlyRunRate)}
          </p>
          <p className="relative z-10 text-xs sm:text-sm text-orange-700/80 dark:text-orange-300/80 mt-2">
            OPEX real pro-rateando facturas anuales.
          </p>
        </div>

        <div className="glass flex flex-col justify-between rounded-2xl p-6 shadow-sm border border-border h-full">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-muted-foreground">
              Suscripciones Activas
            </h2>
            <div className="flex items-center justify-center rounded-xl bg-blue-100 p-2 text-blue-600 dark:bg-blue-500/20">
              <Grid size={20} />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-bold">
            {expenses.filter((e) => e.isActive === "true").length}
            <span className="text-lg sm:text-xl text-muted-foreground font-normal ml-2">
              de {expenses.length} regs.
            </span>
          </p>
        </div>
      </div>

      <div className="pt-6 h-full pb-10">
        <h3 className="text-xl font-bold mb-6">Directorio de Suscripciones</h3>
        {expenses.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center rounded-xl p-12 text-center shadow-sm">
            <div className="mb-4 rounded-full bg-orange-500/10 p-4 text-orange-500">
              <Server size={48} />
            </div>
            <h3 className="mb-2 text-lg font-bold">Sin gastos registrados</h3>
            <p className="max-w-md text-muted-foreground">
              Añade tus instancias de AWS, suscripciones de Figma, o cualquier
              otra herramienta operativa que pague el departamento de TI.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(byCategory).map(([category, items]) => (
              <div key={category} className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground pl-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></div>
                  {category}
                </h4>
                {items.map((expense) => (
                  <div
                    key={expense.id}
                    onClick={() => {
                      setExpenseToEdit(expense);
                      setIsModalOpen(true);
                    }}
                    className={`glass relative cursor-pointer overflow-hidden rounded-xl border p-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md ${
                      expense.isActive === "false"
                        ? "border-border/50 bg-muted/20 opacity-60 grayscale"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-foreground">
                          {expense.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize flex items-center gap-1">
                          {expense.billingCycle === "yearly"
                            ? "Facturación Anual"
                            : "Facturación Mensual"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCOP(expense.amount)}
                        </p>
                        {expense.billingCycle === "yearly" && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            eqv. {formatCOP(Number(expense.amount) / 12)} /mes
                          </p>
                        )}
                      </div>
                    </div>
                    {expense.isActive === "false" && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-destructive">
                        Pausada
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateOpsExpenseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        expense={expenseToEdit}
      />
    </div>
  );
}
