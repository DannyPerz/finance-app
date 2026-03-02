import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import {
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "@/server/transactions.functions";
import { getCategories } from "@/server/categories.functions";
import { CreateTransactionModal } from "@/components/modals/CreateTransactionModal";
import { Pencil, Trash2, Check, X, Download, Repeat } from "lucide-react";

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

const formatCOP = (n: string | number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n));

const formatWithDots = (val: string) => {
  const digits = val.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: string;
  description: string | null;
  date: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  isRecurring: boolean;
  recurrence: "weekly" | "biweekly" | "monthly" | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  type: "income" | "expense";
}

function TransactionRow({
  tx,
  categories,
}: {
  tx: Transaction;
  categories: Category[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [amount, setAmount] = useState(tx.amount);
  const [description, setDescription] = useState(tx.description || "");
  const [date, setDate] = useState(tx.date);
  const [type, setType] = useState<"income" | "expense">(tx.type);
  const [categoryId, setCategoryId] = useState(tx.categoryId || "");

  const handleSave = async () => {
    await updateTransaction({
      data: {
        id: tx.id,
        type,
        amount,
        description: description || undefined,
        date,
        categoryId: categoryId || undefined,
      },
    });
    setEditing(false);
    router.invalidate();
  };

  const handleDelete = async () => {
    await deleteTransaction({ data: { id: tx.id } });
    router.invalidate();
  };

  const handleCancel = () => {
    setAmount(tx.amount);
    setDescription(tx.description || "");
    setDate(tx.date);
    setType(tx.type);
    setCategoryId(tx.categoryId || "");
    setEditing(false);
    setDeleting(false);
  };

  // Delete confirmation
  if (deleting) {
    return (
      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50 last:border-0">
        <p className="text-sm text-muted-foreground">
          ¿Eliminar <strong>{tx.description || formatCOP(tx.amount)}</strong>?
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
    const filteredCats = categories.filter((c) => c.type === type);
    return (
      <div className="space-y-2 py-2.5 border-b border-border/50 last:border-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={type}
            onChange={(e) => {
              const newType = e.target.value as "income" | "expense";
              setType(newType);
              setCategoryId("");
            }}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
          <input
            value={formatWithDots(amount)}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="Monto"
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción"
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Sin categoría</option>
            {filteredCats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
      </div>
    );
  }

  // Default view
  return (
    <div className="group flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
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
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {tx.categoryName || "Sin categoría"} • {tx.date}
            {tx.isRecurring && (
              <span className="inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                <Repeat size={10} />
                {tx.recurrence === "weekly"
                  ? "Semanal"
                  : tx.recurrence === "biweekly"
                    ? "Quincenal"
                    : "Mensual"}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`font-semibold shrink-0 ${tx.type === "income" ? "text-primary" : ""}`}
        >
          {tx.type === "income" ? "+" : "-"}
          {formatCOP(tx.amount)}
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
    </div>
  );
}

function TransactionsPage() {
  const { transactions, categories } = Route.useLoaderData();
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const filtered = transactions.filter((tx) =>
    filter === "all" ? true : tx.type === filter,
  );

  const handleExportCSV = () => {
    window.open("/api/export-csv", "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Movimientos
          </h1>
          <p className="text-muted-foreground text-sm">
            Historial de ingresos y gastos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Exportar CSV"
          >
            <Download size={14} />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <CreateTransactionModal categories={categories} />
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {(
          [
            { value: "all", label: "Todos" },
            { value: "income", label: "Ingresos" },
            { value: "expense", label: "Gastos" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === opt.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center border-dashed">
          <p className="text-muted-foreground">
            No hay movimientos registrados.
          </p>
        </div>
      ) : (
        <div className="glass rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="space-y-0">
            {filtered.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx as Transaction}
                categories={categories as Category[]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
