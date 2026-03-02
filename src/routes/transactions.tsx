import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { getTransactions } from "@/server/transactions.functions";
import { getCategories } from "@/server/categories.functions";
import { CreateTransactionModal } from "@/components/modals/CreateTransactionModal";

export const Route = createFileRoute("/transactions")({
  loader: async () => {
    const [transactions, categories] = await Promise.all([
      getTransactions(),
      getCategories(),
    ]);
    return { transactions, categories };
  },
  component: TransactionsPage,
});

const formatCOP = (n: string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(parseFloat(n));

function TransactionsPage() {
  const { transactions, categories } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Movimientos
          </h1>
          <p className="text-muted-foreground text-sm">
            Historial de ingresos y gastos.
          </p>
        </div>
        <CreateTransactionModal categories={categories} />
      </div>

      {transactions.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center border-dashed">
          <p className="text-muted-foreground">
            No hay movimientos registrados.
          </p>
        </div>
      ) : (
        <div className="glass rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0"
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
      )}
    </div>
  );
}
