import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { createWorkMember, updateWorkMember } from "@/server/work.functions";
import { createWorkMemberSchema } from "@/server/schemas";
import type { CreateWorkMemberInput } from "@/server/schemas";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatWithDots } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  role: string;
  seniority: string;
  contractType: string;
  startDate: string;
  netSalary: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member | null;
}

export function CreateWorkMemberModal({ open, onOpenChange, member }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!member;

  const form = useForm<CreateWorkMemberInput>({
    resolver: zodResolver(createWorkMemberSchema),
    values: {
      name: member?.name || "",
      role: member?.role || "",
      seniority: member?.seniority || "Junior",
      contractType: member?.contractType || "Temporal",
      startDate: member?.startDate || new Date().toISOString().split("T")[0],
      netSalary: member?.netSalary || "",
    },
  });

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

          <div className="grid gap-2">
            <Label htmlFor="netSalary">Salario Neto Mensual (COP)</Label>
            <Controller
              name="netSalary"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="netSalary"
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
            {form.formState.errors.netSalary && (
              <p className="text-sm text-destructive">
                {form.formState.errors.netSalary.message}
              </p>
            )}
          </div>

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
