import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { createWorkMember } from "@/server/work.functions";
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkMemberModal({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateWorkMemberInput>({
    resolver: zodResolver(createWorkMemberSchema),
    defaultValues: {
      name: "",
      role: "",
      seniority: "Junior",
      contractType: "Temporal",
      startDate: new Date().toISOString().split("T")[0],
      netSalary: "",
    },
  });

  async function onSubmit(data: CreateWorkMemberInput) {
    try {
      setIsSubmitting(true);
      await createWorkMember({ data });
      toast.success("Miembro añadido exitosamente");
      form.reset();
      onOpenChange(false);
      router.invalidate();
    } catch (error) {
      console.error(error);
      toast.error("Error al añadir el miembro");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Miembro del Equipo</DialogTitle>
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
                defaultValue={form.getValues("seniority")}
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
                defaultValue={form.getValues("contractType")}
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
            <Input
              id="netSalary"
              type="number"
              min="0"
              {...form.register("netSalary")}
              placeholder="Ej. 3500000"
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
