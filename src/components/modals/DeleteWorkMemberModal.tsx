import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { deleteWorkMember } from "@/server/work.functions";
import { softDeleteWorkMemberSchema } from "@/server/schemas";
import type { SoftDeleteWorkMemberInput } from "@/server/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
}

export function DeleteWorkMemberModal({ open, onOpenChange, member }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SoftDeleteWorkMemberInput>({
    resolver: zodResolver(softDeleteWorkMemberSchema),
    defaultValues: {
      id: member.id,
      endDate: new Date().toISOString().split("T")[0],
    },
  });

  async function onSubmit(data: SoftDeleteWorkMemberInput) {
    try {
      setIsSubmitting(true);
      await deleteWorkMember({ data });
      toast.success("Miembro desvinculado exitosamente");
      form.reset();
      onOpenChange(false);
      router.invalidate();
    } catch (error) {
      console.error(error);
      toast.error("Error al desvincular el miembro");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Desvincular Miembro</DialogTitle>
          <DialogDescription>
            Introduce la fecha final del contrato para{" "}
            <strong>{member.name}</strong>. Esta acción mantendrá su historial
            de nóminas para propósitos de reportes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="endDate">Fecha de Terminación</Label>
            <Input id="endDate" type="date" {...form.register("endDate")} />
            {form.formState.errors.endDate && (
              <p className="text-sm text-destructive">
                {form.formState.errors.endDate.message}
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
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desvinculando
                </>
              ) : (
                "Desvincular"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
