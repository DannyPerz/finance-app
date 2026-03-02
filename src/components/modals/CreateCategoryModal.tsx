import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "@/server/schemas";
import { createCategory } from "@/server/categories.functions";
import { Icon, ICON_OPTIONS } from "@/components/Icon";
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

export function CreateCategoryModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema) as any,
    defaultValues: {
      name: "",
      icon: "Package",
      type: "expense",
      budget: "",
    },
  });

  const formatWithDots = (val: string) => {
    const digits = val.replace(/\D/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const onSubmit = async (data: CreateCategoryInput) => {
    await createCategory({ data });
    setOpen(false);
    form.reset();
    router.invalidate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          + Nueva Categoría
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Categoría</DialogTitle>
          <DialogDescription>
            Crea una categoría para clasificar tus movimientos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Gimnasio" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Type + Budget */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
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

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presupuesto</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="Ej. 500.000"
                        value={formatWithDots(field.value || "")}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          field.onChange(raw);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Icon Picker */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícono</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => field.onChange(iconName)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          field.value === iconName
                            ? "bg-primary/20 ring-2 ring-primary text-primary"
                            : "bg-muted hover:bg-accent text-muted-foreground"
                        }`}
                      >
                        <Icon name={iconName} size={18} />
                      </button>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Crear Categoría
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
