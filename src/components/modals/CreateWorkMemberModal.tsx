import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { createWorkMember, updateWorkMember } from "@/server/work.functions";
import { createWorkMemberSchema, type CreateWorkMemberInput } from "@/server/schemas";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { formatWithDots } from "@/lib/utils";
import { calculatePayrollCosts, type PayrollParameters } from "@/lib/payroll.utils";

interface Member {
  id: string;
  name: string;
  role: string;
  seniority: string;
  contractType: string;
  startDate: string;
  baseSalary: string;
  arlLevel?: "I" | "II" | "III" | "IV" | "V" | string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member | null;
  params?: PayrollParameters;
}

export function CreateWorkMemberModal({
  open,
  onOpenChange,
  member,
  params,
}: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!member;

  const form = useForm({
    resolver: zodResolver(createWorkMemberSchema),
    values: {
      name: member?.name || "",
      role: member?.role || "",
      seniority: member?.seniority || "Junior",
      contractType: member?.contractType || "Temporal",
      startDate: member?.startDate || new Date().toISOString().split("T")[0],
      baseSalary: member?.baseSalary
        ? Math.round(Number(member.baseSalary)).toString()
        : "",
      arlLevel: (member?.arlLevel as "I" | "II" | "III" | "IV" | "V") || "I",
    },
  });

  const watchBaseSalary = form.watch("baseSalary");
  const watchContractType = form.watch("contractType");
  const watchArlLevel = form.watch("arlLevel");

  const liveCosts = useMemo(() => {
    const rawNum = Number(watchBaseSalary.replace(/\D/g, ""));
    if (!rawNum || rawNum === 0) return null;
    return calculatePayrollCosts(
      rawNum,
      watchContractType,
      (watchArlLevel || "I") as "I" | "II" | "III" | "IV" | "V",
      params,
    );
  }, [watchBaseSalary, watchContractType, watchArlLevel, params]);

  async function onSubmit(data: CreateWorkMemberInput) {
    try {
      setIsSubmitting(true);
      if (isEditing && member) {
        await updateWorkMember({ data: { ...data, id: member.id } });
        toast.success("Miembro actualizado exitosamente");
      } else {
        await createWorkMember({ data });
        toast.success("Miembro añadido exitosamente");
        form.reset();
      }
      onOpenChange(false);
      router.invalidate();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing
          ? "Error al actualizar el miembro"
          : "Error al añadir el miembro",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Miembro" : "Añadir Miembro del Equipo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Ej. Juan Pérez"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Rol</Label>
              <Input
                id="role"
                {...form.register("role")}
                placeholder="Ej. Backend Dev"
              />
              {form.formState.errors.role && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="seniority">Seniority</Label>
              <Select
                onValueChange={(val) => form.setValue("seniority", val)}
                value={form.watch("seniority")}
              >
                <SelectTrigger id="seniority">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trainee">Trainee</SelectItem>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Mid">Mid-Level</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contractType">Tipo Contrato</Label>
              <Select
                onValueChange={(val) => form.setValue("contractType", val)}
                value={form.watch("contractType")}
              >
                <SelectTrigger id="contractType">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Indefinido">Indefinido</SelectItem>
                  <SelectItem value="Fijo">Término Fijo</SelectItem>
                  <SelectItem value="Prestación de Servicios">
                    Servicios
                  </SelectItem>
                  <SelectItem value="Temporal">Temporal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="startDate">Fecha Ingreso</Label>
              <Input
                id="startDate"
                type="date"
                {...form.register("startDate")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="baseSalary">Salario Bruto Mensual</Label>
              <Controller
                name="baseSalary"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="baseSalary"
                    inputMode="numeric"
                    placeholder="Ej. 3.500.000"
                    value={formatWithDots(field.value || "")}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      field.onChange(raw);
                    }}
                  />
                )}
              />
              {form.formState.errors.baseSalary && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.baseSalary.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="arlLevel">Nivel ARL Riesgos</Label>
              <Select
                onValueChange={(val) =>
                  form.setValue(
                    "arlLevel",
                    val as "I" | "II" | "III" | "IV" | "V",
                  )
                }
                value={form.watch("arlLevel")}
              >
                <SelectTrigger id="arlLevel">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Clase I (0.522%)</SelectItem>
                  <SelectItem value="II">Clase II (1.044%)</SelectItem>
                  <SelectItem value="III">Clase III (2.436%)</SelectItem>
                  <SelectItem value="IV">Clase IV (4.350%)</SelectItem>
                  <SelectItem value="V">Clase V (6.960%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {liveCosts && (
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <Info size={16} className="mt-0.5 text-blue-600 shrink-0" />
                <div className="grid gap-1.5 flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Proyección de Nómina
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    El empleado recibirá{" "}
                    <strong>${formatWithDots(liveCosts.netSalaryToPay)}</strong>{" "}
                    esperados.{" "}
                    {liveCosts.transportAllowance > 0 && (
                      <span className="text-blue-600 dark:text-blue-300">
                        (Incluye ${formatWithDots(liveCosts.transportAllowance)}{" "}
                        de auxilio de transp.)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    El costo total empresa será aprox.{" "}
                    <strong>
                      ${formatWithDots(liveCosts.totalEmployerCost)}
                    </strong>{" "}
                    /mes.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
