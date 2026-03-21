import { createFileRoute } from "@tanstack/react-router";
import { getOpexExecutiveReport } from "@/server/work.reports.functions";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  TrendingUp,
  Users,
  Server,
  BriefcaseBusiness,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/_protected/work/reports")({
  loader: async () => getOpexExecutiveReport(),
  component: ExecutiveReports,
});

const formatCOP = (n: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n));

function ExecutiveReports() {
  const data = Route.useLoaderData();

  // 1. Current Run Rate Data (Donut Chart)
  const donutData = [
    {
      name: "Talento",
      value: data.currentRunRate.talent,
      fill: "var(--color-talent)",
    },
    {
      name: "Infra & SaaS",
      value: data.currentRunRate.infra,
      fill: "var(--color-infra)",
    },
  ].filter((d) => d.value > 0);

  const donutConfig = {
    talent: {
      label: "Costo Talento (Nomina + Provisiones)",
      color: "hsl(var(--primary))",
    },
    infra: {
      label: "Infraestructura & Ops",
      color: "hsl(var(--orange-500, 24.6 95% 53.1%))", // fallback if no utility is found
    },
  } satisfies ChartConfig;

  // 2. Historical Trend (Bar Chart)
  const barConfig = {
    talentCost: {
      label: "Talento (Histórico)",
      color: "hsl(var(--primary))",
    },
    infraCost: {
      label: "Infra & SaaS (Run Rate)",
      color: "hsl(var(--orange-500, 24.6 95% 53.1%))",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8 flex-1 w-full h-full pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Reportes Ejecutivos (CEO)
        </h1>
        <p className="text-muted-foreground">
          Vista consolidada del P&L para el departamento de Tecnología.
        </p>
      </div>

      {/* Hero Metric - Total Run Rate */}
      <div className="glass flex flex-col justify-between rounded-2xl p-8 shadow-sm border border-border bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-primary/10">
          <BriefcaseBusiness size={160} />
        </div>
        <div className="relative z-10 flex items-center mb-4 gap-3">
          <div className="flex items-center justify-center rounded-xl bg-primary/20 p-3 text-primary">
            <TrendingUp size={24} />
          </div>
          <h2 className="text-xl font-semibold text-primary/90 dark:text-primary">
            Run Rate OPEX Total (Mes Actual)
          </h2>
        </div>
        <p className="relative z-10 text-5xl font-bold text-foreground mt-2">
          {formatCOP(data.currentRunRate.total)}
        </p>
        <p className="relative z-10 text-sm text-muted-foreground mt-4 max-w-2xl">
          Integración del Costo Operacional del Talento Técnico Activo +
          Suscripciones y Servidores. Utiliza esta cifra como punto de verdad
          contable de cuánto le cuesta mes a mes mantener la unidad operando
          ("Burn Rate").
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donut Chart: Distribution */}
        <div className="glass flex flex-col rounded-2xl p-6 shadow-sm border border-border">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-muted-foreground" />
            Distribución del Gasto (Run Rate)
          </h3>

          {donutData.length > 0 ? (
            <div className="flex-1 aspect-square md:aspect-auto md:h-[350px]">
              <ChartContainer
                config={donutConfig}
                className="w-full h-full pb-4"
              >
                <PieChart>
                  <ChartTooltipContent />
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="85%"
                    paddingAngle={2}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl">
              No hay suficientes datos de talento o infraestructura.
            </div>
          )}
        </div>

        {/* Breakdown Lists */}
        <div className="glass flex flex-col rounded-2xl p-6 shadow-sm border border-border gap-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Desglose de la Inversión
          </h3>

          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Talent List */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Users size={16} /> Talento ({data.talentBreakdown.length})
              </h4>
              <div className="space-y-3">
                {data.talentBreakdown.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Sin miembros activos.
                  </p>
                )}
                {data.talentBreakdown.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Infra List */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <Server size={16} /> Infra & SaaS ({data.infraBreakdown.length})
              </h4>
              <div className="space-y-3">
                {data.infraBreakdown.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Sin suscripciones activas.
                  </p>
                )}
                {data.infraBreakdown.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="font-medium truncate max-w-[150px]">
                      {item.name}
                    </span>
                    <span className="font-mono text-xs">
                      {formatCOP(item.normalizedMonthlyCost)} /m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Historical Bar Chart */}
        <div className="glass lg:col-span-2 flex flex-col rounded-2xl p-6 shadow-sm border border-border">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            Evolución del OPEX (Mes a Mes)
          </h3>

          {data.historicalData.length > 0 ? (
            <div className="h-[400px] w-full mt-4">
              <ChartContainer config={barConfig} className="w-full h-full">
                <BarChart
                  data={data.historicalData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="period"
                    tickFormatter={(val) => {
                      const [y, m] = val.split("-");
                      const date = new Date(Number(y), Number(m) - 1);
                      return date
                        .toLocaleString("es-ES", {
                          month: "short",
                          year: "2-digit",
                        })
                        .toUpperCase();
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    className="text-xs text-muted-foreground"
                  />
                  <YAxis
                    tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    className="text-xs text-muted-foreground"
                  />
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      formatCOP(value as number),
                      barConfig[name as keyof typeof barConfig]?.label || name,
                    ]}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar
                    dataKey="talentCost"
                    stackId="a"
                    fill="var(--color-talentCost)"
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey="infraCost"
                    stackId="a"
                    fill="var(--color-infraCost)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl flex-col gap-2">
              <p>No hay cierres históricos guardados.</p>
              <p className="text-sm max-w-sm text-center">
                Ve al panel de "Cierres OPEX" y toma una Fotografía (Snapshot)
                mensual para empezar a construir la trazabilidad financiera.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
