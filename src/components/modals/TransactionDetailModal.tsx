import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { updateTransaction, deleteTransaction } from "@/server/transactions.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Repeat, Trash2, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { formatWithDots } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: string;
  description: string | null;
  date: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  isRecurring: boolean;
  recurrence: "weekly" | "biweekly" | "monthly" | null;
  isPaid: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  type: "income" | "expense";
}

interface Props {
  tx: Transaction;
  categories: Category[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const formatCOP = (n: string | number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n));

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export function TransactionDetailModal({ tx, categories, open, onOpenChange }: Props) {
  const router = useRouter();
  const [type, setType] = useState<"income" | "expense">(tx.type);
  const [amount, setAmount] = useState(tx.amount.split(".")[0]);
  const [description, setDescription] = useState(tx.description || "");
  const [date, setDate] = useState(tx.date);
  const [categoryId, setCategoryId] = useState(tx.categoryId || "");
  const [isRecurring, setIsRecurring] = useState(tx.isRecurring);
  const [recurrence, setRecurrence] = useState<"weekly" | "biweekly" | "monthly" | "">(
    tx.recurrence || ""
  );
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleTypeChange = (v: "income" | "expense") => {
    setType(v);
    setCategoryId("");
  };

  const handleSave = async () => {
    setSaving(true);
    await updateTransaction({
      data: {
        id: tx.id,
        type,
        amount,
        description: description || undefined,
        date,
        categoryId: categoryId || undefined,
        isRecurring,
        recurrence: isRecurring ? (recurrence as "weekly" | "biweekly" | "monthly") : undefined,
      },
    });
    setSaving(false);
    onOpenChange(false);
    router.invalidate();
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteTransaction({ data: { id: tx.id } });
    onOpenChange(false);
    router.invalidate();
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) setConfirmDelete(false);
    onOpenChange(v);
  };

  const selectedCat = categories.find((c) => c.id === categoryId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Detalle del movimiento</DialogTitle>
        </DialogHeader>

        {/* Summary header */}
        <div className="flex items-center gap-4 pb-4 border-b border-border/60">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted shrink-0">
            <Icon
              name={selectedCat?.icon || tx.categoryIcon || "Circle"}
              size={22}
              className="text-muted-foreground"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-base truncate">
              {description || tx.description || "Sin descripción"}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedCat?.name || tx.categoryName || "Sin categoría"} · {formatDate(date)}
              {isRecurring && (
                <span className="inline-flex items-center gap-0.5 ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                  <Repeat size={9} />
                  {recurrence === "weekly" ? "Semanal" : recurrence === "biweekly" ? "Quincenal" : "Mensual"}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className={`font-bold text-lg ${type === "income" ? "text-primary" : ""}`}>
              {type === "income" ? "+" : "-"}{formatCOP(amount || "0")}
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              tx.isPaid
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}>
              {tx.isPaid
                ? <><CheckCircle2 size={9} /> Confirmado</>
                : <><Clock size={9} /> Pendiente</>
              }
            </span>
          </div>
        </div>

        {/* Edit form */}
        <div className="space-y-3 pt-1">
          {/* Type + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tipo</label>
              <Select value={type} onValueChange={(v) => handleTypeChange(v as "income" | "expense")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">
                    <span className="flex items-center gap-2">
                      <Icon name="ArrowUpRight" size={14} /> Gasto
                    </span>
                  </SelectItem>
                  <SelectItem value="income">
                    <span className="flex items-center gap-2">
                      <Icon name="ArrowDownLeft" size={14} /> Ingreso
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Categoría</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <Icon name={cat.icon} size={14} /> {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Monto (COP)</label>
              <Input
                inputMode="numeric"
                value={formatWithDots(amount)}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Fecha</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Descripción</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sin descripción"
            />
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-sm">Movimiento recurrente</span>
            <button
              type="button"
              onClick={() => setIsRecurring((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                isRecurring ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
                  isRecurring ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {isRecurring && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Frecuencia</label>
              <Select
                value={recurrence}
                onValueChange={(v) => setRecurrence(v as "weekly" | "biweekly" | "monthly")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">
                    <span className="flex items-center gap-2"><Icon name="CalendarDays" size={14} /> Semanal</span>
                  </SelectItem>
                  <SelectItem value="biweekly">
                    <span className="flex items-center gap-2"><Icon name="CalendarDays" size={14} /> Quincenal</span>
                  </SelectItem>
                  <SelectItem value="monthly">
                    <span className="flex items-center gap-2"><Icon name="CalendarDays" size={14} /> Mensual</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Footer */}
        {confirmDelete ? (
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/60">
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertTriangle size={14} />
              ¿Confirmar eliminación?
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Eliminando…" : "Eliminar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/60">
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} />
              Eliminar
            </button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
