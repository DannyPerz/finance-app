import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import {
  createOpsExpense,
  updateOpsExpense,
  deleteOpsExpense,
} from "@/server/work.ops.functions";
import { createOpsExpenseSchema, type CreateOpsExpenseInput } from "@/server/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatWithDots } from "@/lib/utils";

interface Expense {
  id: string;
  name: string;
  category: string;
  amount: string;
  billingCycle: "monthly" | "yearly";
  isActive: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
}

const CATEGORIES = [
  "Cloud Hosting",
  "DevTools & Repos",
  "Software & Licencias",
  "Marketing SaaS",
  "Hardware Lease",
  "Consultoría Ops",
];

export function CreateOpsExpenseModal({ open, onOpenChange, expense }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isEditing = !!expense;

  const form = useForm({
    resolver: zodResolver(createOpsExpenseSchema),
    values: {
      name: expense?.name || "",
      category: expense?.category || "Software & Licencias",
      amount: expense?.amount
        ? Math.round(Number(expense.amount)).toString()
        : "",
      billingCycle: expense?.billingCycle || "monthly",
    },
  });

  const watchAmount = form.watch("amount");
  const watchCycle = form.watch("billingCycle");

  async function onSubmit(data: CreateOpsExpenseInput) {
    try {
      setIsSubmitting(true);
      if (isEditing && expense) {
        // Enforce the fields plus the inherited isActive flag for updates
        await updateOpsExpense({
          data: { ...data, id: expense.id, isActive: expense.isActive },
        });
        toast.success("Suscripción actualizada.");
      } else {
        await createOpsExpense({ data });
        toast.success("Suscripción añadida al OPEX.");
        form.reset();
      }
      onOpenChange(false);
      router.invalidate();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing
          ? "Error al actualizar la suscripción"
          : "Error al añadir la suscripción",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus() {
    if (!expense) return;
    try {
      setIsSubmitting(true);
      const newStatus = expense.isActive === "true" ? "false" : "true";
      await updateOpsExpense({
        data: {
          id: expense.id,
          name: expense.name,
          category: expense.category,
          amount: expense.amount,
          billingCycle: expense.billingCycle,
          isActive: newStatus,
        },
      });
      toast.success(
        newStatus === "true"
          ? "Suscripción reanudada."
          : "Suscripción pausada.",
      );
      onOpenChange(false);
      router.invalidate();
    } catch {
      toast.error("Error cambiando el estado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!expense) return;
    try {
      setIsDeleting(true);
      await deleteOpsExpense({ data: { id: expense.id } });
      toast.success("Suscripción eliminada permanentemente.");
      onOpenChange(false);
      router.invalidate();
    } catch {
      toast.error("No se pudo eliminar la suscripción.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Suscripción" : "Registro de Costos"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Proveedor o Herramienta</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Ej. Servidores AWS, Figma, Vercel"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Categoría</Label>
            <Select
              onValueChange={(val) => form.setValue("category", val)}
              value={form.watch("category")}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Costo Facturado</Label>
              <Controller
                name="amount"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="amount"
                    inputMode="numeric"
                    placeholder="Ej. 100.000"
                    value={formatWithDots(field.value || "")}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      field.onChange(raw);
                    }}
                  />
                )}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message as string}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="billingCycle">Cobro Mensual o Anual</Label>
              <Select
                onValueChange={(val) => form.setValue("billingCycle", val)}
                value={form.watch("billingCycle")}
              >
                <SelectTrigger id="billingCycle">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {watchAmount && watchCycle === "yearly" && (
            <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
              Impacto amortizado OPEX:{" "}
              <strong>
                ${formatWithDots(Math.round(Number(watchAmount) / 12))} /
                mensual.
              </strong>
            </div>
          )}

          <div className="flex w-full items-center justify-between pt-4 gap-2">
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="w-10 h-10 shrink-0"
                  onClick={handleDelete}
                  disabled={isSubmitting || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleToggleStatus}
                  disabled={isSubmitting || isDeleting}
                >
                  {expense.isActive === "true" ? "Pausar OPEX" : "Reactivar"}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="w-full sm:w-auto"
            >
              {isSubmitting && !isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando
                </>
              ) : (
                "Guardar Gasto"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
