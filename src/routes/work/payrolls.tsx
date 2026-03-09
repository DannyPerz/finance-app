import { useState, useMemo } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getPayrolls,
  generateMonthlyPayroll,
} from "@/server/work.payroll.functions";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  PlayCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/work/payrolls")({
  loader: async () => getPayrolls(),
  component: PayrollsDashboard,
});

const formatCOP = (n: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n));

function PayrollsDashboard() {
  const router = useRouter();
  const payrolls = Route.useLoaderData();

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [periodToGenerate, setPeriodToGenerate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Group payrolls by period for display
  const groupedPayrolls = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const item of payrolls) {
      if (!groups[item.payroll.period]) {
        groups[item.payroll.period] = [];
      }
      groups[item.payroll.period].push(item);
    }
    // Sort keys descending
    return Object.fromEntries(
      Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])),
    );
  }, [payrolls]);

  async function handleGenerate() {
    if (!periodToGenerate) return;
    try {
      setIsGenerating(true);
      await generateMonthlyPayroll({ data: { period: periodToGenerate } });
      toast.success(`Nómina de ${periodToGenerate} liquidada exitosamente.`);
      setIsGenerateModalOpen(false);
      router.invalidate();
    } catch (err: any) {
      toast.error(err.message || "No se pudo generar la nómina.");
    } finally {
      setIsGenerating(false);
    }
  }

  const periods = Object.keys(groupedPayrolls);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Nóminas</h1>
          <p className="text-muted-foreground">
            Liquidación e histórico de pagos realizados a tu equipo.
          </p>
        </div>
        <button
          onClick={() => {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, "0");
            setPeriodToGenerate(`${yyyy}-${mm}`);
            setIsGenerateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 active:scale-[0.98]"
        >
          <PlayCircle size={18} />
          Liquidar Mes
        </button>
      </div>

      <div className="space-y-6">
        {periods.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center rounded-xl p-12 text-center shadow-sm">
            <div className="mb-4 rounded-full bg-blue-500/10 p-4 text-blue-500">
              <FileText size={48} />
            </div>
            <h3 className="mb-2 text-xl font-bold">Sin histórico de nóminas</h3>
            <p className="max-w-md text-muted-foreground mb-6">
              Aún no has liquidado ningún periodo. Usa el botón superior para
              calcular y generar el registro de la nómina actual.
            </p>
          </div>
        ) : (
          periods.map((period) => {
            const items = groupedPayrolls[period];
            const totalGross = items.reduce(
              (acc, curr) => acc + Number(curr.payroll.grossSalary),
              0,
            );
            const totalNet = items.reduce(
              (acc, curr) => acc + Number(curr.payroll.netPaid),
              0,
            );

            return (
              <PeriodCard
                key={period}
                period={period}
                items={items}
                totalGross={totalGross}
                totalNet={totalNet}
              />
            );
          })
        )}
      </div>

      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Liquidar Nómina del Mes</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="period">Periodo (Año y Mes)</Label>
              <Input
                id="period"
                type="month"
                value={periodToGenerate}
                onChange={(e) => setPeriodToGenerate(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Esto calculará el salario bruto, deducciones y provisiones de
              todos los miembros activos para el periodo seleccionado, y
              generará un borrador de nómina ("Colilla").
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGenerateModalOpen(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !periodToGenerate}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Liquidando...
                </>
              ) : (
                "Generar Nómina"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PeriodCard({ period, items, totalGross, totalNet }: any) {
  const [expanded, setExpanded] = useState(false);

  // Parse YYYY-MM
  const [year, month] = period.split("-");
  const monthNames = [
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
  const displayPeriod = `${monthNames[Number(month) - 1]} ${year}`;

  return (
    <div className="glass overflow-hidden rounded-xl shadow-sm border border-border">
      <div
        className="flex cursor-pointer flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-muted/30 transition-colors gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg capitalize">{displayPeriod}</h3>
            <p className="text-sm text-muted-foreground">
              {items.length} Colillas Generadas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:gap-12">
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Bruto Total
            </p>
            <p className="font-medium">{formatCOP(totalGross)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Líquido Pagado
            </p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCOP(totalNet)}
            </p>
          </div>
          <div className="text-muted-foreground">
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/50 bg-background/50 p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-semibold">Empleado</th>
                  <th className="px-4 py-2 font-semibold">Contrato</th>
                  <th className="px-4 py-2 font-semibold text-right">
                    Devengado (Bruto)
                  </th>
                  <th className="px-4 py-2 font-semibold text-right">
                    Deducciones
                  </th>
                  <th className="px-4 py-2 font-semibold text-right">
                    A Recibir (Neto)
                  </th>
                  <th className="px-4 py-2 font-semibold text-center">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {items.map((item: any) => (
                  <tr key={item.payroll.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.member.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.member.role}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {item.member.contractType}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCOP(item.payroll.grossSalary)}
                    </td>
                    <td className="px-4 py-3 text-right text-destructive/80">
                      -{formatCOP(item.payroll.deductions)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCOP(item.payroll.netPaid)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.payroll.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                          <CheckCircle2 size={12} /> Pagado
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
