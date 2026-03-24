import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Props {
  data: { month: string; rate: number }[];
}

export function SavingsRateChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[120px] text-sm text-muted-foreground">
        Sin datos
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          width={40}
        />
        <ReferenceLine y={20} stroke="oklch(0.75 0.18 175)" strokeDasharray="4 2" opacity={0.5} />
        <ReferenceLine y={0} stroke="oklch(0.65 0.10 15)" strokeDasharray="4 2" opacity={0.5} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const rate = payload[0].value as number;
            const color =
              rate >= 20
                ? "oklch(0.75 0.18 175)"
                : rate >= 5
                  ? "oklch(0.78 0.18 75)"
                  : "oklch(0.65 0.10 15)";
            return (
              <div className="glass rounded-lg px-3 py-2 text-xs border border-border/50 shadow-lg">
                <p className="font-medium mb-1">{label}</p>
                <span style={{ color }} className="font-semibold">
                  {rate.toFixed(1)}% ahorro
                </span>
              </div>
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
