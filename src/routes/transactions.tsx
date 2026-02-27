import { createFileRoute } from "@tanstack/react-router";
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

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Transacciones</h1>
          <p className="text-muted-foreground">
            Historial de movimientos financieros.
          </p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          + Nueva Transacción
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center border-dashed">
          <p className="text-muted-foreground">
            No hay transacciones registradas.
          </p>
        </div>
      ) : (
        <div className="glass rounded-xl p-6 shadow-sm">
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="font-medium">
                    {tx.description || "Sin descripción"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          tx.type === "income"
                            ? "var(--primary)"
                            : tx.type === "expense"
                              ? "var(--destructive)"
                              : "var(--ring)",
                      }}
                    />
                    {tx.categoryName || "Sin categoría"} • {tx.accountName} •{" "}
                    {tx.date}
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
          </div>
        </div>
      )}
    </div>
  );
}
