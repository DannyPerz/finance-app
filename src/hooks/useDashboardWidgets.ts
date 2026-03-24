import { useState, useEffect } from "react";

export const WIDGET_KEYS = [
  "income",
  "expenses",
  "balance",
  "trendChart",
  "pieChart",
  "savingsRate",
  "projection",
  "budgets",
  "goals",
  "topExpenses",
  "activity",
] as const;

export type WidgetKey = (typeof WIDGET_KEYS)[number];

export const WIDGET_LABELS: Record<WidgetKey, string> = {
  income: "Ingresos",
  expenses: "Gastos",
  balance: "Balance",
  trendChart: "Gráfico Ingresos vs Gastos",
  pieChart: "Gráfico Gastos por categoría",
  savingsRate: "Tasa de ahorro",
  projection: "Proyección de cierre de mes",
  budgets: "Presupuestos",
  goals: "Metas de ahorro",
  topExpenses: "Top gastos del mes",
  activity: "Actividad reciente",
};

/** Column span in a 3-column grid (desktop). Mobile is always full-width. */
export const WIDGET_COLS: Record<WidgetKey, 1 | 2 | 3> = {
  income: 1,
  expenses: 1,
  balance: 1,
  trendChart: 2,
  pieChart: 1,
  savingsRate: 3,
  projection: 3,
  budgets: 3,
  goals: 3,
  topExpenses: 1,
  activity: 2,
};

const STORAGE_KEY = "finova:dashboard:widgets";

type WidgetPrefs = {
  order: WidgetKey[];
  hidden: WidgetKey[];
};

const DEFAULT_PREFS: WidgetPrefs = {
  order: [...WIDGET_KEYS],
  hidden: [],
};

function loadPrefs(): WidgetPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<WidgetPrefs>;
    const knownKeys = new Set(WIDGET_KEYS);
    const savedOrder = (parsed.order ?? []).filter((k) =>
      knownKeys.has(k as WidgetKey),
    ) as WidgetKey[];
    const newKeys = WIDGET_KEYS.filter((k) => !savedOrder.includes(k));
    return {
      order: [...savedOrder, ...newKeys],
      hidden: (parsed.hidden ?? []).filter((k) =>
        knownKeys.has(k as WidgetKey),
      ) as WidgetKey[],
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function useDashboardWidgets() {
  const [prefs, setPrefs] = useState<WidgetPrefs>(DEFAULT_PREFS);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const save = (next: WidgetPrefs) => {
    setPrefs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const reorder = (newOrder: WidgetKey[]) => save({ ...prefs, order: newOrder });

  const toggleVisibility = (key: WidgetKey) => {
    const hidden = prefs.hidden.includes(key)
      ? prefs.hidden.filter((k) => k !== key)
      : [...prefs.hidden, key];
    save({ ...prefs, hidden });
  };

  const isVisible = (key: WidgetKey) => !prefs.hidden.includes(key);

  const reset = () => save(DEFAULT_PREFS);

  return { order: prefs.order, hidden: prefs.hidden, isVisible, reorder, toggleVisibility, reset };
}
