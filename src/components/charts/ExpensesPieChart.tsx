import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { category: string; total: number }[];
}

const COLORS = [
  "oklch(0.75 0.18 175)", // teal (primary)
  "oklch(0.75 0.14 250)", // blue
  "oklch(0.70 0.17 330)", // magenta
  "oklch(0.80 0.16 85)", // amber
  "oklch(0.72 0.15 145)", // green
  "oklch(0.68 0.14 290)", // purple
  "oklch(0.78 0.12 50)", // orange
  "oklch(0.65 0.10 210)", // slate-blue
];

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export function ExpensesPieChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
        Sin gastos este mes
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="flex items-center gap-6">
      <div className="w-[200px] h-[200px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              strokeWidth={2}
              stroke="var(--background)"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0];
                return (
                  <div className="glass rounded-lg px-3 py-2 text-xs border border-border/50 shadow-lg">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground">
                      {formatCOP(item.value as number)}
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2 text-sm min-w-0">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.total / total) * 100) : 0;
          return (
            <div key={d.category} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="truncate">{d.category}</span>
              <span className="text-muted-foreground ml-auto flex-shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
