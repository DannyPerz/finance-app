import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getPayrollParameters,
  updatePayrollParameters,
} from "@/server/work.settings.functions";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePayrollParametersSchema } from "@/server/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  Settings,
  Briefcase,
  RefreshCcw,
  HandCoins,
} from "lucide-react";
import { formatWithDots } from "@/lib/utils";

export const Route = createFileRoute("/work/settings")({
  loader: async () =>
    getPayrollParameters({ data: { year: new Date().getFullYear() } }),
  component: SettingsDashboard,
});

function SettingsDashboard() {
  const router = useRouter();
  const config = Route.useLoaderData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(updatePayrollParametersSchema),
    defaultValues: {
      year: Number(config.year),
      smmlv: Math.round(Number(config.smmlv)).toString(),
      transportAllowance: Math.round(
        Number(config.transportAllowance),
      ).toString(),
      healthEmployee: config.healthEmployee,
      pensionEmployee: config.pensionEmployee,
      solidarityFundThreshold: config.solidarityFundThreshold,
      healthEmployer: config.healthEmployer,
      pensionEmployer: config.pensionEmployer,
      ccf: config.ccf,
      sena: config.sena,
      icbf: config.icbf,
      severance: config.severance,
      serviceBonus: config.serviceBonus,
      vacation: config.vacation,
      exonerationThreshold: config.exonerationThreshold,
    },
  });

  async function onSubmit(data: any) {
    try {
      setIsSubmitting(true);
      await updatePayrollParameters({ data });
      toast.success("Parámetros actualizados exitosamente");
      router.invalidate();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la configuración");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Parámetros de Nómina
          </h1>
          <p className="text-muted-foreground">
            Configura las reglas contables, topes y porcentajes de ley vigentes
            para {config.year}.
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Bases y Topes */}
        <div className="glass rounded-xl border border-border overflow-hidden">
          <div className="bg-muted/40 px-6 py-4 border-b border-border flex items-center gap-3">
            <Settings className="text-blue-500" size={20} />
            <h2 className="font-semibold">Bases Gubernamentales y Topes</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label>Salario Mínimo Mensual (SMMLV)</Label>
              <Controller
                name="smmlv"
                control={form.control}
                render={({ field }) => (
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatWithDots(field.value.toString())}
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, ""))
                    }
                  />
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label>Auxilio de Transporte Vigente</Label>
              <Controller
                name="transportAllowance"
                control={form.control}
                render={({ field }) => (
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatWithDots(field.value.toString())}
                      onChange={(e) =>
                        field.onChange(e.target.value.replace(/\D/g, ""))
                      }
                    />
                  </div>
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label>Tope Exoneración Ley 1819 (en SMMLV)</Label>
              <Input
                type="number"
                step="1"
                {...form.register("exonerationThreshold")}
              />
              <p className="text-xs text-muted-foreground">
                Salarios debajo de este multiplicador no pagan SENA/ICBF ni
                Salud Empleador.
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Tope Fondo de Solidaridad (en SMMLV)</Label>
              <Input
                type="number"
                step="1"
                {...form.register("solidarityFundThreshold")}
              />
              <p className="text-xs text-muted-foreground">
                Salarios por encima de este multiplicador aportan 1% extra al
                FSP.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Deducciones */}
        <div className="glass rounded-xl border border-border overflow-hidden">
          <div className="bg-muted/40 px-6 py-4 border-b border-border flex items-center gap-3">
            <HandCoins className="text-orange-500" size={20} />
            <h2 className="font-semibold">
              Deducciones al Empleado (Retenciones de Nómina)
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label>Salud Empleado (Decimal)</Label>
              <Input
                type="number"
                step="0.001"
                {...form.register("healthEmployee")}
              />
              <p className="text-xs text-muted-foreground">Ej 0.04 = 4%.</p>
            </div>
            <div className="grid gap-2">
              <Label>Pensión Empleado (Decimal)</Label>
              <Input
                type="number"
                step="0.001"
                {...form.register("pensionEmployee")}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Seguridad Social y Parafiscales */}
        <div className="glass rounded-xl border border-border overflow-hidden">
          <div className="bg-muted/40 px-6 py-4 border-b border-border flex items-center gap-3">
            <Briefcase className="text-emerald-500" size={20} />
            <h2 className="font-semibold">
              Costo Real Empleador (Seguridad Social y Parafiscales)
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label>Salud Empleador</Label>
              <Input
                type="number"
                step="0.001"
                {...form.register("healthEmployer")}
              />
              <p className="text-xs text-muted-foreground">
                Ej 0.085 = 8.5%. Sólo se aplica si el salario supera el Tope de
                Exoneración Ley 1819.
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Pensión Empleador</Label>
              <Input
                type="number"
                step="0.001"
                {...form.register("pensionEmployer")}
              />
              <p className="text-xs text-muted-foreground">Ej 0.12 = 12%.</p>
            </div>
            <div className="grid gap-2">
              <Label>Caja de Compensación Familiar (CCF)</Label>
              <Input type="number" step="0.001" {...form.register("ccf")} />
            </div>
            <div className="grid gap-2">
              <Label>SENA</Label>
              <Input type="number" step="0.001" {...form.register("sena")} />
              <p className="text-xs text-muted-foreground">
                Exento si Ley 1819 aplica.
              </p>
            </div>
            <div className="grid gap-2">
              <Label>ICBF</Label>
              <Input type="number" step="0.001" {...form.register("icbf")} />
              <p className="text-xs text-muted-foreground">
                Exento si Ley 1819 aplica.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Provisiones */}
        <div className="glass rounded-xl border border-border overflow-hidden">
          <div className="bg-muted/40 px-6 py-4 border-b border-border flex items-center gap-3">
            <RefreshCcw className="text-purple-500" size={20} />
            <h2 className="font-semibold">
              Provisiones de Prestaciones Sociales (Carga Mensual)
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label>Prima de Servicios</Label>
              <Input
                type="number"
                step="0.0001"
                {...form.register("serviceBonus")}
              />
              <p className="text-xs text-muted-foreground">
                Aprox 1 salario anual / 12 = 0.0833 (8.33%).
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Cesantías</Label>
              <Input
                type="number"
                step="0.0001"
                {...form.register("severance")}
              />
            </div>
            <div className="grid gap-2">
              <Label>Vacaciones</Label>
              <Input
                type="number"
                step="0.0001"
                {...form.register("vacation")}
              />
              <p className="text-xs text-muted-foreground">
                Aprox 0.0417 (4.17%).
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 w-full sticky bottom-6 z-10 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              toast.info("Cambios descartados");
            }}
            disabled={isSubmitting || !form.formState.isDirty}
          >
            Descartar Cambios
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isDirty}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando en DB...
              </>
            ) : (
              "Guardar Reglas Vigentes (Año Actual)"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
