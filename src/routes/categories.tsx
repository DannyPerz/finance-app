import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getCategories,
  updateCategory,
  deleteCategory,
} from "@/server/categories.functions";
import { CreateCategoryModal } from "@/components/modals/CreateCategoryModal";
import { Icon, ICON_OPTIONS } from "@/components/Icon";
import { Pencil, Trash2, Check, X } from "lucide-react";

export const Route = createFileRoute("/categories")({
  loader: () => getCategories(),
  component: CategoriesPage,
});

interface Category {
  id: string;
  name: string;
  icon: string;
  type: "income" | "expense";
  budget: string | null;
}

const formatBudget = (val: string) => {
  const digits = val.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

function CategoryRow({ cat }: { cat: Category }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const [icon, setIcon] = useState(cat.icon);
  const [budget, setBudget] = useState(
    cat.budget ? cat.budget.split(".")[0] : "",
  );
  const [showIcons, setShowIcons] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isIncome = cat.type === "income";

  const handleSave = async () => {
    if (!name.trim()) return;
    await updateCategory({
      data: {
        id: cat.id,
        name: name.trim(),
        icon,
        type: cat.type,
        budget: budget || undefined,
      },
    });
    setEditing(false);
    setShowIcons(false);
    router.invalidate();
  };

  const handleDelete = async () => {
    await deleteCategory({ data: { id: cat.id } });
    router.invalidate();
  };

  const handleCancel = () => {
    setName(cat.name);
    setIcon(cat.icon);
    setBudget(cat.budget ? cat.budget.split(".")[0] : "");
    setEditing(false);
    setShowIcons(false);
    setDeleting(false);
  };

  // Delete confirmation
  if (deleting) {
    return (
      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50 last:border-0">
        <p className="text-sm text-muted-foreground">
          ¿Eliminar <strong>{cat.name}</strong>?
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleDelete}
            className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-500/10"
            title="Confirmar"
          >
            <Check size={15} />
          </button>
          <button
            onClick={() => setDeleting(false)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent"
            title="Cancelar"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  // Editing mode
  if (editing) {
    return (
      <div className="space-y-2 py-2.5 border-b border-border/50 last:border-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowIcons(!showIcons)}
            className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
              isIncome
                ? "bg-primary/10 hover:bg-primary/20"
                : "bg-muted hover:bg-accent"
            }`}
            title="Cambiar ícono"
          >
            <Icon
              name={icon}
              size={16}
              className={isIncome ? "text-primary" : "text-muted-foreground"}
            />
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className="flex-1 min-w-0 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
          <input
            value={formatBudget(budget)}
            onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))}
            placeholder="Presupuesto"
            inputMode="numeric"
            className="w-28 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleSave}
            className="rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10"
            title="Guardar"
          >
            <Check size={15} />
          </button>
          <button
            onClick={handleCancel}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent"
            title="Cancelar"
          >
            <X size={15} />
          </button>
        </div>
        {showIcons && (
          <div className="flex flex-wrap gap-1.5 pl-10">
            {ICON_OPTIONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => {
                  setIcon(ic);
                  setShowIcons(false);
                }}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                  icon === ic
                    ? "bg-primary/20 ring-2 ring-primary text-primary"
                    : "bg-muted hover:bg-accent text-muted-foreground"
                }`}
              >
                <Icon name={ic} size={14} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default view
  return (
    <div className="group flex items-center justify-between gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${
            isIncome ? "bg-primary/10" : "bg-muted"
          }`}
        >
          <Icon
            name={cat.icon}
            size={16}
            className={isIncome ? "text-primary" : "text-muted-foreground"}
          />
        </div>
        <div className="min-w-0">
          <span className="font-medium">{cat.name}</span>
          {cat.budget && (
            <p className="text-xs text-muted-foreground">
              Presupuesto: {formatCOP(parseFloat(cat.budget))}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => setEditing(true)}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Editar"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => setDeleting(true)}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
          title="Eliminar"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function CategoriesPage() {
  const categories = Route.useLoaderData() as Category[];

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
          {/* Income */}
          <div className="glass rounded-xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="ArrowDownLeft" size={18} className="text-primary" />
              Ingresos
            </h2>
            <div>
              {incomeCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sin categorías de ingreso.
                </p>
              ) : (
                incomeCategories.map((cat) => (
                  <CategoryRow key={cat.id} cat={cat} />
                ))
              )}
            </div>
          </div>

          {/* Expense */}
          <div className="glass rounded-xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon
                name="ArrowUpRight"
                size={18}
                className="text-muted-foreground"
              />
              Gastos
            </h2>
            <div>
              {expenseCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sin categorías de gasto.
                </p>
              ) : (
                expenseCategories.map((cat) => (
                  <CategoryRow key={cat.id} cat={cat} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
