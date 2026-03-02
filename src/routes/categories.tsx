import { createFileRoute } from "@tanstack/react-router";
import { getCategories } from "@/server/categories.functions";
import { CreateCategoryModal } from "@/components/modals/CreateCategoryModal";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/categories")({
  loader: () => getCategories(),
  component: CategoriesPage,
});

function CategoriesPage() {
  const categories = Route.useLoaderData();

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Categorías
          </h1>
          <p className="text-muted-foreground text-sm">
            Organiza tus ingresos y gastos.
          </p>
        </div>
        <CreateCategoryModal />
      </div>

      {categories.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center border-dashed">
          <p className="text-muted-foreground">No hay categorías creadas.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* Income Categories */}
          <div className="glass rounded-xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="ArrowDownLeft" size={18} className="text-primary" />
              Ingresos
            </h2>
            <div className="space-y-2">
              {incomeCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sin categorías de ingreso.
                </p>
              ) : (
                incomeCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      <Icon
                        name={cat.icon}
                        size={16}
                        className="text-primary"
                      />
                    </div>
                    <span className="font-medium">{cat.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Expense Categories */}
          <div className="glass rounded-xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon
                name="ArrowUpRight"
                size={18}
                className="text-muted-foreground"
              />
              Gastos
            </h2>
            <div className="space-y-2">
              {expenseCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sin categorías de gasto.
                </p>
              ) : (
                expenseCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                      <Icon
                        name={cat.icon}
                        size={16}
                        className="text-muted-foreground"
                      />
                    </div>
                    <span className="font-medium">{cat.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
