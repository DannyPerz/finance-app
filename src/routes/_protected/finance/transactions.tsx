import { useState, useEffect, useRef } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import {
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "@/server/transactions.functions";
import { getCategories } from "@/server/categories.functions";
import { CreateTransactionModal } from "@/components/modals/CreateTransactionModal";
import { ImportTransactionsModal } from "@/components/modals/ImportTransactionsModal";
import { CategoryFilterDropdown } from "@/components/CategoryFilterDropdown";
import {
  Pencil,
  Trash2,
  Check,
  X,
  Download,
  Upload,
  Repeat,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/_protected/finance/transactions")({
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

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const dateLabel = (iso: string) => {
  const todayStr = new Date().toLocaleDateString("en-CA");
  const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString("en-CA");
  if (iso === todayStr) return "Hoy";
  if (iso === yesterdayStr) return "Ayer";
  return formatDate(iso);
};

const groupByDate = (txs: Transaction[]) => {
  const map = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const group = map.get(tx.date) ?? [];
    group.push(tx);
    map.set(tx.date, group);
  }
  return map;
};

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
  const [amount, setAmount] = useState(tx.amount.split(".")[0]);
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
    setAmount(tx.amount.split(".")[0]);
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
    )
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
            {tx.categoryName || "Sin categoría"}
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
        <div className="flex items-center gap-0.5 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
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

const PAGE_SIZE = 25;

function pageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++)
    pages.push(p);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

function TransactionsPage() {
  const { transactions, categories } = Route.useLoaderData();
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node))
        setActionsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounce search 300 ms
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset to page 1 on any filter change
  useEffect(() => { setPage(1); }, [typeFilter, selectedCategoryIds, search]);

  // When type changes, reset category selection
  const handleTypeFilter = (v: "all" | "income" | "expense") => {
    setTypeFilter(v);
    setSelectedCategoryIds(new Set());
  };

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (selectedCategoryIds.size > 0 && !selectedCategoryIds.has(tx.categoryId ?? "")) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        tx.description?.toLowerCase().includes(q) ||
        tx.categoryName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasActiveFilters = typeFilter !== "all" || selectedCategoryIds.size > 0 || search !== "";

  const handleExportCSV = () => window.open("/api/export-csv", "_blank");

  const clearFilters = () => {
    setTypeFilter("all");
    setSelectedCategoryIds(new Set());
    setSearchInput("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Movimientos
          </h1>
          <p className="text-muted-foreground text-sm hidden sm:block">
            Historial de ingresos y gastos.
          </p>
        </div>

        {/* Split button: New + actions dropdown */}
        <div className="flex items-stretch shrink-0" ref={actionsRef}>
          <CreateTransactionModal categories={categories} splitLeft />

          <div className="relative flex">
            <button
              onClick={() => setActionsOpen((o) => !o)}
              className="flex items-center rounded-r-lg border border-l-0 border-primary bg-primary px-2.5 text-primary-foreground transition-colors hover:bg-primary/90"
              title="Más opciones"
            >
              <ChevronDown size={14} className={`transition-transform ${actionsOpen ? "rotate-180" : ""}`} />
            </button>

            {actionsOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border border-border bg-background shadow-lg py-1">
                <button
                  onClick={() => { setImportOpen(true); setActionsOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <Upload size={14} className="text-muted-foreground" />
                  Importar CSV
                </button>
                <button
                  onClick={() => { handleExportCSV(); setActionsOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <Download size={14} className="text-muted-foreground" />
                  Exportar CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImportTransactionsModal
        categories={categories}
        open={importOpen}
        onOpenChange={setImportOpen}
      />

      {/* Filters row */}
      <div className="flex flex-col gap-2">
        {/* Type tabs + Category on same row */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-muted p-1 shrink-0">
            {(
              [
                { value: "all", label: "Todos" },
                { value: "income", label: "Ingresos" },
                { value: "expense", label: "Gastos" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleTypeFilter(opt.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  typeFilter === opt.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <CategoryFilterDropdown
            categories={categories}
            selected={selectedCategoryIds}
            onChange={setSelectedCategoryIds}
            typeFilter={typeFilter}
          />
        </div>

        {/* Search full width */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar por descripción o categoría…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
        </div>

      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground -mt-2">
        {filtered.length} movimiento{filtered.length !== 1 ? "s" : ""}
        {hasActiveFilters && " encontrados"}
        {totalPages > 1 && ` · página ${page} de ${totalPages}`}
      </p>

      {/* List */}
      {paginated.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center border-dashed">
          <p className="text-muted-foreground">
            {hasActiveFilters
              ? "Ningún movimiento coincide con los filtros."
              : "No hay movimientos registrados."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(groupByDate(paginated as Transaction[])).map(([date, txs]) => (
            <div key={date} className="glass rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-2.5 border-b border-border/50 bg-muted/30">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {dateLabel(date)}
                </span>
              </div>
              <div className="px-4 sm:px-6">
                {txs.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    categories={categories as Category[]}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft size={15} />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <div className="flex items-center gap-1">
            {pageRange(page, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-8 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                    page === p
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
