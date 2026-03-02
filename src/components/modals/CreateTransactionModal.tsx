import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from "@/server/schemas";
import { createTransaction } from "@/server/transactions.functions";
import { Icon } from "@/components/Icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
}

interface Props {
  categories: Category[];
}

export function CreateTransactionModal({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema) as any,
    defaultValues: {
      type: "expense",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const selectedType = form.watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  const onSubmit = async (data: CreateTransactionInput) => {
    await createTransaction({ data });
    setOpen(false);
    form.reset();
    router.invalidate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          + Nuevo Movimiento
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento</DialogTitle>
          <DialogDescription>Registra un ingreso o gasto.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={(v) => {
                      field.onChange(v);
                      form.setValue("categoryId", undefined);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">
                        <span className="flex items-center gap-2">
                          <Icon name="ArrowUpRight" size={14} />
                          Gasto
                        </span>
                      </SelectItem>
                      <SelectItem value="income">
                        <span className="flex items-center gap-2">
                          <Icon name="ArrowDownLeft" size={14} />
                          Ingreso
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Amount + Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => {
                  const formatWithDots = (val: string) => {
                    const digits = val.replace(/\D/g, "");
                    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                  };
                  return (
                    <FormItem>
                      <FormLabel>Monto (COP)</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          placeholder="Ej. 1.500.000"
                          value={formatWithDots(field.value || "")}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            field.onChange(raw);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Supermercado Éxito" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <Icon name={cat.icon} size={14} />
                            {cat.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Guardar Movimiento
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
