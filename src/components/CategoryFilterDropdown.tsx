import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/Icon";
import { Filter, ChevronDown } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  type: "income" | "expense";
}

interface Props {
  categories: Category[];
  selected: Set<string>;
  onChange: (ids: Set<string>) => void;
  /** Limits visible sections. When "income" or "expense", hides the other section and section headers. */
  typeFilter?: "all" | "income" | "expense";
}

export function CategoryFilterDropdown({
  categories,
  selected,
  onChange,
  typeFilter = "all",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  const visibleIncome =
    typeFilter !== "expense" ? categories.filter((c) => c.type === "income") : [];
  const visibleExpense =
    typeFilter !== "income" ? categories.filter((c) => c.type === "expense") : [];
  const showSectionHeaders = typeFilter === "all";

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent outline-none focus:ring-2 focus:ring-primary/30"
      >
        <Filter size={14} className="text-muted-foreground shrink-0" />
        {selected.size > 0 ? (
          <>
            <span className="hidden sm:inline">{`${selected.size} categoría${selected.size > 1 ? "s" : ""}`}</span>
            <span className="sm:hidden flex items-center justify-center min-w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
              {selected.size}
            </span>
          </>
        ) : (
          <span className="hidden sm:inline">Todas las categorías</span>
        )}
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border border-border bg-background shadow-lg py-1 max-h-72 overflow-y-auto">
          {selected.size > 0 && (
            <button
              onClick={() => onChange(new Set())}
              className="w-full text-left px-3 py-1.5 text-xs text-primary hover:bg-accent transition-colors"
            >
              ✕ Limpiar filtro
            </button>
          )}

          {visibleIncome.length > 0 && (
            <>
              {showSectionHeaders && (
                <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ingresos
                </p>
              )}
              {visibleIncome.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2.5 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                    className="rounded border-border accent-[oklch(0.75_0.18_175)]"
                  />
                  <Icon name={c.icon} size={14} className="text-muted-foreground shrink-0" />
                  {c.name}
                </label>
              ))}
            </>
          )}

          {visibleExpense.length > 0 && (
            <>
              {showSectionHeaders && (
                <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                  Gastos
                </p>
              )}
              {visibleExpense.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2.5 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                    className="rounded border-border accent-[oklch(0.75_0.18_175)]"
                  />
                  <Icon name={c.icon} size={14} className="text-muted-foreground shrink-0" />
                  {c.name}
                </label>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
