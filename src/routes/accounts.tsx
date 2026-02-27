import { createFileRoute } from "@tanstack/react-router";
import TopBar from "@/components/TopBar";
import { Plus, Wallet as WalletIcon } from "lucide-react";
import { getAccounts } from "@/server/accounts.functions";

export const Route = createFileRoute("/accounts")({
  loader: () => getAccounts(),
  component: AccountsPage,
});

const formatCOP = (n: string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(parseFloat(n));

function AccountsPage() {
  const accounts = Route.useLoaderData();

  return (
    <>
      <TopBar title="Cuentas" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Gestiona tus cuentas bancarias y billeteras digitales
            </p>
            <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Nueva Cuenta
            </button>
          </div>

          {accounts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
              <WalletIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No tienes cuentas registradas aún
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {account.type === "bank" ? "Banco" : "Billetera"}
                      </p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {account.name}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                      <WalletIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      {formatCOP(account.balance)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {account.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
