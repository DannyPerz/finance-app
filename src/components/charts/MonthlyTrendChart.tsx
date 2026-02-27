import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { month: string; income: number; expense: number }[];
}

const formatCOP = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

const formatFull = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export function MonthlyTrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
        Sin datos de tendencia
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={4} barCategoryGap="20%">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          opacity={0.3}
          vertical={false}
        />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={formatCOP}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          width={60}
        />
        <Tooltip
          cursor={{ fill: "var(--accent)", opacity: 0.15 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="glass rounded-lg px-3 py-2 text-xs border border-border/50 shadow-lg space-y-1">
                <p className="font-medium">{label}</p>
                {payload.map((p) => (
                  <div
                    key={p.dataKey as string}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-muted-foreground">
                      {p.dataKey === "income" ? "Ingresos" : "Gastos"}:
                    </span>
                    <span className="font-medium">
                      {formatFull(p.value as number)}
                    </span>
                  </div>
                ))}
              </div>
            );
          }}
        />
        <Bar
          dataKey="income"
          fill="oklch(0.75 0.18 175)"
          radius={[4, 4, 0, 0]}
          name="Ingresos"
        />
        <Bar
          dataKey="expense"
          fill="oklch(0.65 0.10 15)"
          radius={[4, 4, 0, 0]}
          name="Gastos"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
