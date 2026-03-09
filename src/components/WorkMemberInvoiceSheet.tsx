import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatWithDots } from "@/lib/utils";
import { calculatePayrollCosts } from "@/lib/payroll.utils";

interface Member {
  id: string;
  name: string;
  role: string;
  seniority: string;
  contractType: string;
  startDate: string;
  baseSalary: string;
  arlLevel?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
}

export function WorkMemberInvoiceSheet({ open, onOpenChange, member }: Props) {
  const costs = calculatePayrollCosts(
    parseFloat(member.baseSalary),
    member.contractType,
    (member.arlLevel || "I") as "I" | "II" | "III" | "IV" | "V",
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">Hoja de Costos / Nómina</SheetTitle>
          <SheetDescription>
            {member.name} • {member.role} ({member.contractType})
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Section 1: Empleado */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span className="h-px bg-border flex-1"></span>
              Cálculo Empleado
              <span className="h-px bg-border flex-1"></span>
            </h3>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center text-foreground font-medium">
                <span>Salario Base (Bruto)</span>
                <span>${formatWithDots(costs.baseSalary)}</span>
              </div>

              {costs.employeeDeductions.total > 0 && (
                <div className="space-y-2 pt-2 border-t border-dashed">
                  <div className="flex justify-between items-center text-destructive/80">
                    <span>(-) Aporte Salud (4%)</span>
                    <span>
                      -${formatWithDots(costs.employeeDeductions.health)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-destructive/80">
                    <span>(-) Aporte Pensión (4%)</span>
                    <span>
                      -${formatWithDots(costs.employeeDeductions.pension)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t font-semibold text-lg text-emerald-600 dark:text-emerald-400">
                <span>Neto a Consignar</span>
                <span>${formatWithDots(costs.netSalaryToPay)}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Empresa */}
          {costs.employerProvisions.total > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span className="h-px bg-border flex-1"></span>
                Sobrecosto Empresa
                <span className="h-px bg-border flex-1"></span>
              </h3>

              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>(+) Pensión Empleador (12%)</span>
                    <span>
                      ${formatWithDots(costs.employerProvisions.pension)}
                    </span>
                  </div>

                  {/* Exoneraciones Explícitas Ley 1819 / Art. 114-1 ET */}
                  <div className="flex justify-between items-center text-muted-foreground/60 text-xs py-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                      Salud Empleador (8.5%)
                    </span>
                    <span className="text-emerald-500 font-medium">
                      Exonerado (Art. 114-1)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground/60 text-xs py-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                      SENA (2%) e ICBF (3%)
                    </span>
                    <span className="text-emerald-500 font-medium">
                      Exonerados (Art. 114-1)
                    </span>
                  </div>

                  <div className="flex justify-between text-muted-foreground pt-1">
                    <span>(+) Caja de Compensación (4%)</span>
                    <span>${formatWithDots(costs.employerProvisions.ccf)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>(+) ARL Riesgos (0.522%)</span>
                    <span>${formatWithDots(costs.employerProvisions.arl)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>(+) Prima de Servicios (8.33%)</span>
                    <span>
                      ${formatWithDots(costs.employerProvisions.serviceBonus)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>(+) Cesantías (8.33%)</span>
                    <span>
                      ${formatWithDots(costs.employerProvisions.severance)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>(+) Int. de Cesantías (1% mensual)</span>
                    <span>
                      $
                      {formatWithDots(
                        costs.employerProvisions.severanceInterest,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>(+) Vacaciones (4.17%)</span>
                    <span>
                      ${formatWithDots(costs.employerProvisions.vacation)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-border font-semibold text-foreground">
                  <span>Total Provisiones</span>
                  <span>${formatWithDots(costs.employerProvisions.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Gran Total */}
          <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-5 mt-6">
            <div className="flex justify-between items-center text-orange-700 dark:text-orange-400 font-bold text-xl">
              <span>Costo Real Empresa</span>
              <span>${formatWithDots(costs.totalEmployerCost)}</span>
            </div>
            <p className="text-xs text-orange-600/80 dark:text-orange-300/80 mt-1">
              Este es el impacto real mensual en el P&L de la compañía.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
