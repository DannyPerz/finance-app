import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { getTransactions, toggleTransactionPaid } from "@/server/transactions.functions";
import { getCategories } from "@/server/categories.functions";
import { CreateTransactionModal } from "@/components/modals/CreateTransactionModal";
import { ImportTransactionsModal } from "@/components/modals/ImportTransactionsModal";
import { TransactionDetailModal } from "@/components/modals/TransactionDetailModal";
import { CategoryFilterDropdown } from "@/components/CategoryFilterDropdown";
import {
  Download,
  Upload,
  Repeat,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
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
  const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString(
    "en-CA",
  );
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
  isPaid: boolean;
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
  onTogglePaid,
}: {
  tx: Transaction;
  categories: Category[];
  onTogglePaid: (id: string, isPaid: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="group flex items-center border-b border-border/50 last:border-0 hover:bg-accent/40 transition-colors">
        {/* Paid toggle — independent del click que abre el modal */}
        <button
          onClick={() => onTogglePaid(tx.id, !tx.isPaid)}
          title={tx.isPaid ? "Confirmado — click para desmarcar" : "Marcar como pagado/recibido"}
          className={`shrink-0 mx-3 sm:mx-4 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all ${
            tx.isPaid
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-primary/60"
          }`}
        >
          {tx.isPaid && <Check size={10} strokeWidth={3} />}
        </button>

        {/* Row body — abre el modal */}
        <button
          onClick={() => setOpen(true)}
          className="flex flex-1 items-center justify-between py-2.5 pr-4 sm:pr-6 text-left min-w-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${tx.isPaid ? "bg-primary/10" : "bg-muted group-hover:bg-background"}`}>
              <Icon
                name={tx.categoryIcon || "Circle"}
                size={16}
                className={tx.isPaid ? "text-primary" : "text-muted-foreground"}
              />
            </div>
            <div className="min-w-0">
              <p className={`font-medium truncate ${!tx.isPaid ? "text-muted-foreground" : ""}`}>
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
          <div
            className={`font-semibold shrink-0 ml-3 ${
              !tx.isPaid
                ? "text-muted-foreground"
                : tx.type === "income"
                  ? "text-primary"
                  : ""
            }`}
          >
            {tx.type === "income" ? "+" : "-"}
            {formatCOP(tx.amount)}
          </div>
        </button>
      </div>

      <TransactionDetailModal
        tx={tx}
        categories={categories}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

const PAGE_SIZE = 25;

function pageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  )
    pages.push(p);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

function TransactionsPage() {
  const { transactions, categories } = Route.useLoaderData();
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [pendingOnly, setPendingOnly] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(),
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Optimistic paid overrides — evita reload completo al hacer toggle
  const [paidOverrides, setPaidOverrides] = useState<Map<string, boolean>>(new Map());

  const handleTogglePaid = async (id: string, isPaid: boolean) => {
    setPaidOverrides((prev) => new Map(prev).set(id, isPaid));
    try {
      await toggleTransactionPaid({ data: { id, isPaid } });
    } catch {
      setPaidOverrides((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const txWithOverrides = transactions.map((t) => ({
    ...t,
    isPaid: paidOverrides.has(t.id) ? (paidOverrides.get(t.id) as boolean) : t.isPaid,
  }));

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
  useEffect(() => {
    setPage(1);
  }, [typeFilter, pendingOnly, selectedCategoryIds, search]);

  // When type changes, reset category selection
  const handleTypeFilter = (v: "all" | "income" | "expense") => {
    setTypeFilter(v);
    setSelectedCategoryIds(new Set());
  };

  const filtered = txWithOverrides.filter((tx) => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (pendingOnly && tx.isPaid) return false;
    if (
      selectedCategoryIds.size > 0 &&
      !selectedCategoryIds.has(tx.categoryId ?? "")
    )
      return false;
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
  const hasActiveFilters =
    typeFilter !== "all" || pendingOnly || selectedCategoryIds.size > 0 || search !== "";

  const handleExportCSV = () => window.open("/api/export-csv", "_blank");

  const clearFilters = () => {
    setTypeFilter("all");
    setPendingOnly(false);
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
              <ChevronDown
                size={14}
                className={`transition-transform ${actionsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {actionsOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border border-border bg-background shadow-lg py-1">
                <button
                  onClick={() => {
                    setImportOpen(true);
                    setActionsOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  <Upload size={14} className="text-muted-foreground" />
                  Importar CSV
                </button>
                <button
                  onClick={() => {
                    handleExportCSV();
                    setActionsOpen(false);
                  }}
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
        <div className="flex flex-wrap items-center gap-2">
          {/* Type tabs */}
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

          {/* Pending filter */}
          <button
            onClick={() => setPendingOnly((v) => !v)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              pendingOnly
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${pendingOnly ? "border-primary" : "border-current"}`}>
              {pendingOnly && <Check size={8} strokeWidth={3} className="text-primary" />}
            </span>
            Sin confirmar
          </button>

          {/* Category filter */}
          <CategoryFilterDropdown
            categories={categories}
            selected={selectedCategoryIds}
            onChange={setSelectedCategoryIds}
            typeFilter={typeFilter}
          />
        </div>

        {/* Search */}
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
          {Array.from(groupByDate(paginated as Transaction[])).map(
            ([date, txs]) => (
              <div
                key={date}
                className="glass rounded-xl shadow-sm overflow-hidden"
              >
                <div className="px-4 sm:px-6 py-2.5 border-b border-border/50 bg-muted/30">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {dateLabel(date)}
                  </span>
                </div>
                <div>
                  {txs.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      categories={categories as Category[]}
                      onTogglePaid={handleTogglePaid}
                    />
                  ))}
                </div>
              </div>
            ),
          )}
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
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 text-muted-foreground text-sm"
                >
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
