import { useState, useEffect } from "react";

export const WIDGET_KEYS = [
  "metrics",
  "charts",
  "savingsRate",
  "projection",
  "budgets",
  "goals",
  "topExpenses",
  "activity",
] as const;

export type WidgetKey = (typeof WIDGET_KEYS)[number];

export const WIDGET_LABELS: Record<WidgetKey, string> = {
  metrics: "Métricas (Ingresos, Gastos, Balance)",
  charts: "Gráficos de tendencia y categorías",
  savingsRate: "Tasa de ahorro",
  projection: "Proyección de cierre de mes",
  budgets: "Presupuestos",
  goals: "Metas de ahorro",
  topExpenses: "Top gastos del mes",
  activity: "Actividad reciente",
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
    // Merge with defaults to handle newly added widgets
    const knownKeys = new Set(WIDGET_KEYS);
    const savedOrder = (parsed.order ?? []).filter((k) =>
      knownKeys.has(k as WidgetKey),
    ) as WidgetKey[];
    // Append any new widgets not in saved order
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
