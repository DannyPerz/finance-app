import { useState, useMemo, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { getTransactions } from "@/server/transactions.functions";
import { getCategories } from "@/server/categories.functions";
import { ExpensesPieChart } from "@/components/charts/ExpensesPieChart";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { ChevronLeft, ChevronRight, ChevronDown, Filter } from "lucide-react";

export const Route = createFileRoute("/finance/")({
  loader: async () => {
    const [transactions, categories] = await Promise.all([
      getTransactions(),
      getCategories(),
    ]);
    return { transactions, categories };
  },
  component: Dashboard,
});

const formatCOP = (n: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n));

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const MONTH_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function Dashboard() {
  const { transactions, categories } = Route.useLoaderData();
  const now = new Date();

  // ─── Filter State ──────────────────────────────────────
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(),
  );
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearCategoryFilter = () => setSelectedCategoryIds(new Set());

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // ─── Derived Data ──────────────────────────────────────
  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const d = new Date(tx.date + "T00:00:00");
      const matchesMonth =
        d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      const matchesCategory =
        selectedCategoryIds.size === 0 ||
        (tx.categoryName &&
          [...selectedCategoryIds].some(
            (id) =>
              categories.find((c) => c.id === id)?.name === tx.categoryName,
          ));
      return matchesMonth && matchesCategory;
    });
  }, [
    transactions,
    selectedMonth,
    selectedYear,
    selectedCategoryIds,
    categories,
  ]);

  const { income, expense, balance } = useMemo(() => {
    let inc = 0,
      exp = 0;
    for (const tx of monthTransactions) {
      const amount = parseFloat(tx.amount);
      if (tx.type === "income") inc += amount;
      else exp += amount;
    }
    return { income: inc, expense: exp, balance: inc - exp };
  }, [monthTransactions]);

  const expensesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of monthTransactions) {
      if (tx.type !== "expense") continue;
      const cat = tx.categoryName || "Sin categoría";
      map.set(cat, (map.get(cat) || 0) + parseFloat(tx.amount));
    }
    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [monthTransactions]);

  const monthlyTrend = useMemo(() => {
    const months: {
      key: string;
      label: string;
      income: number;
      expense: number;
    }[] = [];
    for (let i = 5; i >= 0; i--) {
      let m = selectedMonth - i;
      let y = selectedYear;
      while (m < 0) {
        m += 12;
        y--;
      }
      const key = `${y}-${String(m + 1).padStart(2, `0`)}`;
      months.push({ key, label: MONTH_SHORT[m], income: 0, expense: 0 });
    }
    for (const tx of transactions) {
      const d = new Date(tx.date + "T00:00:00");
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, `0`)}`;
      const entry = months.find((m) => m.key === key);
      if (!entry) continue;
      const amount = parseFloat(tx.amount);
      if (tx.type === "income") entry.income += amount;
      else entry.expense += amount;
    }
    return months.map(({ label, income, expense }) => ({
      month: label,
      income,
      expense,
    }));
  }, [transactions, selectedMonth, selectedYear]);

  // ─── Budget Progress ──────────────────────────────────
  const budgetProgress = useMemo(() => {
    const expenseCats = categories.filter(
      (c) => c.type === "expense" && c.budget && parseFloat(c.budget) > 0,
    );
    if (expenseCats.length === 0) return [];

    return expenseCats
      .map((cat) => {
        const budgetAmount = parseFloat(cat.budget!);
        let spent = 0;
        for (const tx of transactions) {
          if (tx.type !== "expense" || tx.categoryName !== cat.name) continue;
          const d = new Date(tx.date + "T00:00:00");
          if (
            d.getMonth() === selectedMonth &&
            d.getFullYear() === selectedYear
          ) {
            spent += parseFloat(tx.amount);
          }
        }
        const pct =
          budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
        return {
          name: cat.name,
          icon: cat.icon,
          budget: budgetAmount,
          spent,
          pct,
        };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [categories, transactions, selectedMonth, selectedYear]);

  // ─── Comparative Summary (vs previous month) ──────────
  const comparison = useMemo(() => {
    let prevMonth = selectedMonth - 1;
    let prevYear = selectedYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }

    let curIncome = 0,
      curExpense = 0,
      prevIncome = 0,
      prevExpense = 0;
    for (const tx of transactions) {
      const d = new Date(tx.date + "T00:00:00");
      const m = d.getMonth(),
        y = d.getFullYear();
      const amount = parseFloat(tx.amount);
      if (m === selectedMonth && y === selectedYear) {
        if (tx.type === "income") curIncome += amount;
        else curExpense += amount;
      }
      if (m === prevMonth && y === prevYear) {
        if (tx.type === "income") prevIncome += amount;
        else prevExpense += amount;
      }
    }

    const expDiff =
      prevExpense > 0
        ? Math.round(((curExpense - prevExpense) / prevExpense) * 100)
        : null;
    const incDiff =
      prevIncome > 0
        ? Math.round(((curIncome - prevIncome) / prevIncome) * 100)
        : null;

    return { expDiff, incDiff, prevMonth, prevYear };
  }, [transactions, selectedMonth, selectedYear]);

  const isEmpty = transactions.length === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Tu resumen financiero en tiempo real.
          </p>
        </div>
        <div className="glass rounded-xl p-10 text-center">
          <h2 className="text-xl font-semibold">¡Bienvenido a Finova!</h2>
          <p className="mt-2 text-muted-foreground">
            Aún no tienes movimientos registrados. Crea tu primer ingreso o
            gasto desde la sección de Movimientos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevMonth}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={goToNextMonth}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setCategoryDropdownOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent outline-none focus:ring-2 focus:ring-primary/30"
          >
            <Filter size={14} className="text-muted-foreground" />
            <span>
              {selectedCategoryIds.size === 0
                ? "Todas las categorías"
                : `${selectedCategoryIds.size} categoría${selectedCategoryIds.size > 1 ? `s` : ``}`}
            </span>
            <ChevronDown
              size={14}
              className={`text-muted-foreground transition-transform ${categoryDropdownOpen ? `rotate-180` : ``}`}
            />
          </button>
          {categoryDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border border-border bg-background shadow-lg py-1 max-h-72 overflow-y-auto">
              {selectedCategoryIds.size > 0 && (
                <button
                  onClick={clearCategoryFilter}
                  className="w-full text-left px-3 py-1.5 text-xs text-primary hover:bg-accent transition-colors"
                >
                  ✕ Limpiar filtro
                </button>
              )}
              <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ingresos
              </p>
              {categories
                .filter((c) => c.type === "income")
                .map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.has(c.id)}
                      onChange={() => toggleCategory(c.id)}
                      className="rounded border-border accent-[oklch(0.75_0.18_175)]"
                    />
                    <Icon
                      name={c.icon}
                      size={14}
                      className="text-muted-foreground"
                    />
                    {c.name}
                  </label>
                ))}
              <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                Gastos
              </p>
              {categories
                .filter((c) => c.type === "expense")
                .map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2.5 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.has(c.id)}
                      onChange={() => toggleCategory(c.id)}
                      className="rounded border-border accent-[oklch(0.75_0.18_175)]"
                    />
                    <Icon
                      name={c.icon}
                      size={14}
                      className="text-muted-foreground"
                    />
                    {c.name}
                  </label>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        <div className="glass rounded-xl p-5 sm:p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Ingresos
          </h3>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-primary">
            {formatCOP(income)}
          </div>
          {comparison.incDiff !== null && (
            <p
              className={`text-xs mt-1 ${comparison.incDiff >= 0 ? `text-primary` : `text-destructive`}`}
            >
              {comparison.incDiff >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(comparison.incDiff)}% vs{" "}
              {MONTH_SHORT[comparison.prevMonth]}
            </p>
          )}
        </div>
        <div className="glass rounded-xl p-5 sm:p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Gastos</h3>
          <div className="mt-2 text-2xl sm:text-3xl font-bold">
            {formatCOP(expense)}
          </div>
          {comparison.expDiff !== null && (
            <p
              className={`text-xs mt-1 ${comparison.expDiff <= 0 ? `text-primary` : `text-destructive`}`}
            >
              {comparison.expDiff >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(comparison.expDiff)}% vs{" "}
              {MONTH_SHORT[comparison.prevMonth]}
            </p>
          )}
        </div>
        <div
          className={`glass rounded-xl p-5 sm:p-6 shadow-sm border ${balance >= 0 ? `border-primary/20 bg-linear-to-br from-background to-primary/5` : `border-destructive/20 bg-linear-to-br from-background to-destructive/5`}`}
        >
          <h3 className="text-sm font-medium text-muted-foreground">Balance</h3>
          <div
            className={`mt-2 text-2xl sm:text-3xl font-bold ${balance >= 0 ? `text-primary` : `text-destructive`}`}
          >
            {balance >= 0 ? "+" : ""}
            {formatCOP(balance)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="glass rounded-xl p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Ingresos vs Gastos
          </h2>
          <MonthlyTrendChart data={monthlyTrend} />
        </div>
        <div className="glass rounded-xl p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Gastos por Categoría
          </h2>
          <ExpensesPieChart data={expensesByCategory} />
        </div>
      </div>

      {/* Budget Progress */}
      {budgetProgress.length > 0 && (
        <div className="glass rounded-xl p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Presupuestos
          </h2>
          <div className="space-y-4">
            {budgetProgress.map((bp) => (
              <div key={bp.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon
                      name={bp.icon}
                      size={14}
                      className="text-muted-foreground"
                    />
                    <span className="font-medium">{bp.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatCOP(bp.spent)} / {formatCOP(bp.budget)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      bp.pct > 100
                        ? "bg-destructive"
                        : bp.pct >= 80
                          ? "bg-amber-500"
                          : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(bp.pct, 100)}%` }}
                  />
                </div>
                <p
                  className={`text-xs ${bp.pct > 100 ? `text-destructive font-medium` : bp.pct >= 80 ? `text-amber-500` : `text-muted-foreground`}`}
                >
                  {bp.pct}% usado
                  {bp.pct > 100 && " — ¡Límite superado!"}
                  {bp.pct === 100 && " — Presupuesto agotado"}
                  {bp.pct >= 80 && bp.pct < 100 && " — Cerca del límite"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity */}
      <div className="glass rounded-xl p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Actividad — {MONTH_NAMES[selectedMonth]}
        </h2>
        {monthTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Sin movimientos en este periodo.
          </p>
        ) : (
          <div className="space-y-3">
            {monthTransactions.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
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
                  className={`font-semibold shrink-0 ml-3 ${tx.type === `income` ? `text-primary` : ``}`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCOP(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
