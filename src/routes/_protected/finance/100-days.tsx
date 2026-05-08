import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Check, RotateCcw, Trash2, AlertTriangle, Trophy, Loader2 } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "#/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import { cn } from "#/lib/utils";
import {
  getChallenge,
  createChallenge,
  toggleChallengeDay,
  resetChallenge,
  deleteChallenge,
} from "#/server/challenge.functions";

// ─── Constants ───────────────────────────────────────────

const TOTAL_DAYS = 100;
const AMOUNT_PER_DAY = 1_000;
const GRAND_TOTAL = (TOTAL_DAYS * (TOTAL_DAYS + 1) * AMOUNT_PER_DAY) / 2; // 5_050_000

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const formatAmount = (day: number) => {
  const amount = day * AMOUNT_PER_DAY;
  return amount >= 1_000_000
    ? `$${(amount / 1_000_000).toFixed(1)}M`
    : `$${(amount / 1_000).toFixed(0)}k`;
};

// ─── Route ───────────────────────────────────────────────

export const Route = createFileRoute("/_protected/finance/100-days")({
  loader: () => getChallenge(),
  component: ChallengePage,
});

// ─── Create Modal ─────────────────────────────────────────

function CreateChallengeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("Reto 100 días");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !startDate) return;
    setSaving(true);
    await createChallenge({ data: { name: name.trim(), startDate } });
    setSaving(false);
    onOpenChange(false);
    router.invalidate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo reto de ahorro</DialogTitle>
          <DialogDescription>
            100 días, $5.050.000 al final. ¿Arrancamos?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Nombre del reto
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Reto 100 días"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Fecha de inicio
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !name.trim() || !startDate}
          >
            {saving ? "Creando…" : "Crear reto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Day Cell ─────────────────────────────────────────────

function DayCell({
  day,
  paid,
  pending,
  onConfirm,
}: {
  day: number;
  paid: boolean;
  pending: boolean;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [snapshotPaid, setSnapshotPaid] = useState(paid);
  const amount = day * AMOUNT_PER_DAY;

  const handleOpenChange = (next: boolean) => {
    if (next) setSnapshotPaid(paid);
    setOpen(next);
  };

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          disabled={pending}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 rounded-lg p-1.5 text-center transition-all select-none aspect-square w-full",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            paid
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted hover:bg-muted/70 text-foreground",
            pending && "animate-pulse opacity-70",
          )}
        >
          <span className="text-[10px] font-medium opacity-60 leading-none tabular-nums">
            {day}
          </span>
          {pending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : paid ? (
            <Check size={13} strokeWidth={2.5} />
          ) : (
            <span className="text-xs font-bold leading-none tabular-nums">
              {formatAmount(day)}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3"
        side="top"
        align="center"
        sideOffset={6}
      >
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div>
            <p className="text-sm font-semibold">{formatCOP(amount)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {snapshotPaid ? "¿Quitar este pago?" : "¿Confirmar pago?"}
            </p>
          </div>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs"
              onClick={() => setOpen(false)}
            >
              No
            </Button>
            <Button
              size="sm"
              variant={snapshotPaid ? "destructive" : "default"}
              className="h-7 px-3 text-xs"
              onClick={handleConfirm}
            >
              {snapshotPaid ? "Quitar" : "Sí, pagado"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Page ─────────────────────────────────────────────────

function ChallengePage() {
  const loaderChallenge = Route.useLoaderData();
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actioning, setActioning] = useState(false);
  const [pendingDay, setPendingDay] = useState<number | null>(null);

  // Optimistic local state for paidDays
  const [paidDays, setPaidDays] = useState<number[]>(
    loaderChallenge?.paidDays ?? [],
  );

  const challenge = loaderChallenge;

  const completedCount = paidDays.length;
  const totalSaved = paidDays.reduce((acc, d) => acc + d * AMOUNT_PER_DAY, 0);
  const progressPct = Math.round((completedCount / TOTAL_DAYS) * 100);
  const done = completedCount === TOTAL_DAYS;

  const handleToggle = async (day: number) => {
    if (!challenge || pendingDay !== null) return;
    const wasPaid = paidDays.includes(day);
    const newPaidDays = wasPaid
      ? paidDays.filter((d) => d !== day)
      : [...paidDays, day];

    setPendingDay(day);
    setPaidDays(newPaidDays);
    try {
      await toggleChallengeDay({ data: { id: challenge.id, day, paid: !wasPaid } });
    } catch {
      setPaidDays(paidDays);
    } finally {
      setPendingDay(null);
    }
  };

  const handleReset = async () => {
    if (!challenge) return;
    setActioning(true);
    await resetChallenge({ data: { id: challenge.id } });
    setPaidDays([]);
    setConfirmReset(false);
    setActioning(false);
  };

  const handleDelete = async () => {
    if (!challenge) return;
    setActioning(true);
    await deleteChallenge({ data: { id: challenge.id } });
    setConfirmDelete(false);
    setActioning(false);
    router.invalidate();
  };

  // ── Empty state ──────────────────────────────────────────

  if (!challenge) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            100 Días de Ahorro
          </h1>
          <p className="text-muted-foreground text-sm hidden sm:block">
            Ahorrá $5.050.000 tachando un día a la vez.
          </p>
        </div>

        <div className="glass rounded-xl p-12 text-center border-dashed max-w-md mx-auto">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted mx-auto mb-4">
            <Trophy size={28} className="text-muted-foreground" />
          </div>
          <p className="font-semibold">Sin reto activo</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            Día 1 → $1.000 · Día 50 → $50.000 · Día 100 → $100.000
            <br />
            Total al completar: {formatCOP(GRAND_TOTAL)}
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-5 text-sm text-primary hover:underline"
          >
            Crear reto →
          </button>
        </div>

        <CreateChallengeModal open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    );
  }

  // ── Active challenge ─────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {challenge.name}
          </h1>
          <p className="text-muted-foreground text-sm hidden sm:block">
            Tocá cada casilla para marcarla como pagada.
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
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
                disabled={actioning}
                className="text-xs text-destructive font-medium hover:underline"
              >
                Sí
              </button>
            </div>
          ) : confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-500 flex items-center gap-1">
                <AlertTriangle size={12} /> ¿Reiniciar?
              </span>
              <button
                onClick={() => setConfirmReset(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                No
              </button>
              <button
                onClick={handleReset}
                disabled={actioning}
                className="text-xs text-amber-500 font-medium hover:underline"
              >
                Sí
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setConfirmReset(true)}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="Reiniciar reto"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"
                title="Eliminar reto"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="glass rounded-xl px-5 py-4 shadow-sm">
        <div className="flex flex-wrap gap-4 sm:gap-8 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Días completados</p>
            <p className="text-xl font-bold">
              {completedCount}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}/ {TOTAL_DAYS}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total ahorrado</p>
            <p className="text-xl font-bold text-primary">
              {formatCOP(totalSaved)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Objetivo</p>
            <p className="text-xl font-bold">{formatCOP(GRAND_TOTAL)}</p>
          </div>
          {done && (
            <div className="flex items-center gap-2">
              <Trophy size={20} className="text-primary" />
              <span className="font-semibold text-primary">¡Completado!</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{progressPct}% completado</p>
        </div>
      </div>

      {/* Grid */}
      <div className="glass rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => (
            <DayCell
              key={day}
              day={day}
              paid={paidDays.includes(day)}
              pending={pendingDay === day}
              onConfirm={() => handleToggle(day)}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-muted inline-block" />
          Pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary inline-block" />
          Pagado
        </span>
        <span className="ml-auto">
          Falta: {formatCOP(GRAND_TOTAL - totalSaved)}
        </span>
      </div>

    </div>
  );
}
