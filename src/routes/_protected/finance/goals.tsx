import { useState, useEffect } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  getGoals,
  createGoal,
  updateGoal,
  contributeToGoal,
  deleteGoal,
} from "@/server/goals.functions";
import { Icon } from "@/components/Icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, PiggyBank, AlertTriangle, CalendarClock } from "lucide-react";
import { formatWithDots } from "@/lib/utils";

export const Route = createFileRoute("/_protected/finance/goals")({
  loader: () => getGoals(),
  component: GoalsPage,
});

const GOAL_ICONS = [
  "PiggyBank", "Home", "Car", "Plane", "GraduationCap", "Heart",
  "Smartphone", "Laptop", "Dumbbell", "Baby", "Gift", "Music",
  "Briefcase", "TrendingUp", "CreditCard", "Package",
];

const formatCOP = (n: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n));

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const daysLeft = (deadline: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(deadline + "T00:00:00");
  const diff = Math.ceil((end.getTime() - today.getTime()) / 86400000);
  return diff;
};

interface Goal {
  id: string;
  name: string;
  icon: string;
  targetAmount: string;
  savedAmount: string;
  deadline: string | null;
  createdAt: string;
}

// ─── Goal Form Modal ──────────────────────────────────────

function GoalFormModal({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Goal;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "PiggyBank");
  const [target, setTarget] = useState(initial?.targetAmount?.split(".")[0] ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setIcon(initial?.icon ?? "PiggyBank");
      setTarget(initial?.targetAmount?.split(".")[0] ?? "");
      setDeadline(initial?.deadline ?? "");
    }
  }, [open]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !target) return;
    setSaving(true);
    if (initial) {
      await updateGoal({
        data: {
          id: initial.id,
          name: name.trim(),
          icon,
          targetAmount: target,
          deadline: deadline || undefined,
        },
      });
    } else {
      await createGoal({
        data: {
          name: name.trim(),
          icon,
          targetAmount: target,
          deadline: deadline || undefined,
        },
      });
    }
    setSaving(false);
    onOpenChange(false);
    router.invalidate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar meta" : "Nueva meta de ahorro"}</DialogTitle>
          <DialogDescription>
            {initial ? "Modifica los datos de tu meta." : "Define tu objetivo y empieza a ahorrar."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Icon picker */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Ícono</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
                    icon === ic
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent text-muted-foreground"
                  }`}
                >
                  <Icon name={ic} size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nombre</label>
            <Input
              placeholder="Ej. Fondo de emergencia"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Target + Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Monto objetivo (COP)</label>
              <Input
                inputMode="numeric"
                placeholder="Ej. 5.000.000"
                value={formatWithDots(target)}
                onChange={(e) => setTarget(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Fecha límite (opcional)</label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !name.trim() || !target}>
            {saving ? "Guardando…" : initial ? "Guardar" : "Crear meta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Contribute Modal ─────────────────────────────────────

function ContributeModal({
  goal,
  open,
  onOpenChange,
}: {
  goal: Goal;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setAmount("");
  }, [open]);

  const remaining =
    Math.max(0, parseFloat(goal.targetAmount) - parseFloat(goal.savedAmount ?? "0"));

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setSaving(true);
    await contributeToGoal({ data: { id: goal.id, amount } });
    setSaving(false);
    onOpenChange(false);
    router.invalidate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name={goal.icon} size={18} className="text-primary" />
            {goal.name}
          </DialogTitle>
          <DialogDescription>
            Registra un abono a esta meta. Falta {formatCOP(remaining)}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Monto a abonar (COP)</label>
          <Input
            inputMode="numeric"
            placeholder="Ej. 200.000"
            value={formatWithDots(amount)}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !amount}>
            {saving ? "Guardando…" : "Abonar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Goal Card ────────────────────────────────────────────

function GoalCard({ goal }: { goal: Goal }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const saved = parseFloat(goal.savedAmount ?? "0");
  const target = parseFloat(goal.targetAmount);
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const done = pct >= 100;

  const days = goal.deadline ? daysLeft(goal.deadline) : null;
  const deadlineUrgent = days !== null && days <= 30 && !done;
  const deadlinePassed = days !== null && days < 0 && !done;

  const handleDelete = async () => {
    setDeleting(true);
    await deleteGoal({ data: { id: goal.id } });
    router.invalidate();
  };

  return (
    <>
      <div className={`glass rounded-xl p-5 shadow-sm space-y-4 ${done ? "border border-primary/30 bg-primary/5" : ""}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl ${done ? "bg-primary/15" : "bg-muted"}`}>
              <Icon name={goal.icon} size={20} className={done ? "text-primary" : "text-muted-foreground"} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{goal.name}</p>
              {goal.deadline && (
                <p className={`text-xs flex items-center gap-1 mt-0.5 ${
                  deadlinePassed ? "text-destructive" : deadlineUrgent ? "text-amber-500" : "text-muted-foreground"
                }`}>
                  <CalendarClock size={11} />
                  {deadlinePassed
                    ? `Venció el ${formatDate(goal.deadline)}`
                    : days === 0
                      ? "Vence hoy"
                      : `${formatDate(goal.deadline)} · ${days}d restantes`}
                </p>
              )}
            </div>
          </div>

          {done ? (
            <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary">
              ¡Completada!
            </span>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setEditOpen(true)}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Pencil size={14} />
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-1.5 pl-1">
                  <span className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle size={12} /> ¿Eliminar?
                  </span>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    No
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs text-destructive font-medium hover:underline"
                  >
                    Sí
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={`font-semibold ${done ? "text-primary" : ""}`}>
              {formatCOP(saved)}
            </span>
            <span className="text-muted-foreground text-xs">
              de {formatCOP(target)}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${done ? "bg-primary" : pct >= 75 ? "bg-primary" : pct >= 40 ? "bg-amber-500" : "bg-muted-foreground/50"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{pct}% logrado</p>
        </div>

        {/* Contribute button */}
        {!done && (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setContributeOpen(true)}
          >
            <Plus size={14} className="mr-1.5" />
            Abonar
          </Button>
        )}
      </div>

      <GoalFormModal open={editOpen} onOpenChange={setEditOpen} initial={goal} />
      <ContributeModal goal={goal} open={contributeOpen} onOpenChange={setContributeOpen} />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────

function GoalsPage() {
  const goals = Route.useLoaderData();
  const [createOpen, setCreateOpen] = useState(false);

  const active = goals.filter((g) => parseFloat(g.savedAmount ?? "0") < parseFloat(g.targetAmount));
  const completed = goals.filter((g) => parseFloat(g.savedAmount ?? "0") >= parseFloat(g.targetAmount));

  const totalSaved = goals.reduce((acc, g) => acc + parseFloat(g.savedAmount ?? "0"), 0);
  const totalTarget = goals.reduce((acc, g) => acc + parseFloat(g.targetAmount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Metas de ahorro</h1>
          <p className="text-muted-foreground text-sm hidden sm:block">
            Define objetivos y registra tu progreso.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground rounded-lg transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nueva meta</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center border-dashed">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted mx-auto mb-4">
            <PiggyBank size={28} className="text-muted-foreground" />
          </div>
          <p className="font-semibold">Sin metas de ahorro</p>
          <p className="text-sm text-muted-foreground mt-1">
            Crea tu primera meta y empieza a ahorrar con propósito.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Crear meta →
          </button>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          {goals.length > 1 && (
            <div className="glass rounded-xl px-5 py-4 shadow-sm flex flex-wrap gap-4 sm:gap-8">
              <div>
                <p className="text-xs text-muted-foreground">Total ahorrado</p>
                <p className="text-xl font-bold text-primary">{formatCOP(totalSaved)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total objetivo</p>
                <p className="text-xl font-bold">{formatCOP(totalTarget)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Metas activas</p>
                <p className="text-xl font-bold">{active.length}</p>
              </div>
              {completed.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Completadas</p>
                  <p className="text-xl font-bold text-primary">{completed.length}</p>
                </div>
              )}
            </div>
          )}

          {/* Active goals */}
          {active.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((g) => (
                <GoalCard key={g.id} goal={g} />
              ))}
            </div>
          )}

          {/* Completed goals */}
          {completed.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Completadas
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((g) => (
                  <GoalCard key={g.id} goal={g} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <GoalFormModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
