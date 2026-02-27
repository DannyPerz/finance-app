import { createFileRoute } from "@tanstack/react-router";
import { getDebts } from "@/server/debts.functions";
import { CreateDebtModal } from "@/components/modals/CreateDebtModal";

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
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Deudas</h1>
          <p className="text-muted-foreground">Seguimiento y amortización.</p>
        </div>
        <CreateDebtModal />
      </div>

      {debts.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center border-dashed">
          <p className="text-muted-foreground">¡No tienes deudas! 🎉</p>
        </div>
      ) : (
        <div className="space-y-6">
          {debts.map((debt) => {
            const progress = Math.round(
              (debt.paidInstallments / debt.totalInstallments) * 100,
            );
            const remaining = debt.totalInstallments - debt.paidInstallments;

            return (
              <div key={debt.id} className="glass rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{debt.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tasa: {debt.interestRate}% mensual • {remaining} cuotas
                      restantes
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {progress}% pagado
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Monto Original
                    </p>
                    <p className="mt-0.5 text-lg font-bold">
                      {formatCOP(debt.principal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Saldo Restante
                    </p>
                    <p className="mt-0.5 text-lg font-bold">
                      {formatCOP(debt.remainingBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Cuota Mensual
                    </p>
                    <p className="mt-0.5 text-lg font-bold">
                      {formatCOP(debt.monthlyPayment)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>
                      {debt.paidInstallments} de {debt.totalInstallments} cuotas
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
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
  );
}
