import { createFileRoute } from "@tanstack/react-router";
import { getAccounts } from "@/server/accounts.functions";
import { CreateAccountModal } from "@/components/modals/CreateAccountModal";

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
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Cuentas</h1>
          <p className="text-muted-foreground">
            Tus cuentas bancarias y billeteras.
          </p>
        </div>
        <CreateAccountModal />
      </div>

      {accounts.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center border-dashed">
          <p className="text-muted-foreground">
            No tienes cuentas registradas.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {accounts.map((acc) => (
            <div key={acc.id} className="glass rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">
                {acc.type === "bank" ? "Banco" : "Billetera"}
              </h3>
              <div className="mt-2 text-2xl font-bold">
                {formatCOP(acc.balance)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {acc.name} • {acc.currency}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
