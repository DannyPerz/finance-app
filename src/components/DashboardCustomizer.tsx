
import { Eye, EyeOff, RotateCcw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { type WidgetKey, WIDGET_LABELS } from "@/hooks/useDashboardWidgets";

// ─── Sortable row ─────────────────────────────────────────

function Row({
  id,
  visible,
  onToggle,
}: {
  id: WidgetKey;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 bg-background transition-colors border-border/50 ${!visible ? "opacity-50" : ""}`}
    >
      <span className="flex-1 text-sm font-medium">{WIDGET_LABELS[id]}</span>

      {/* Visibility toggle */}
      <button
        onClick={onToggle}
        className={`rounded p-1 transition-colors ${
          visible
            ? "text-primary hover:bg-primary/10"
            : "text-muted-foreground hover:bg-muted"
        }`}
        title={visible ? "Ocultar widget" : "Mostrar widget"}
      >
        {visible ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>
    </div>
  );
}

// ─── DashboardCustomizer ──────────────────────────────────

interface Props {
  order: WidgetKey[];
  isVisible: (k: WidgetKey) => boolean;
  toggleVisibility: (k: WidgetKey) => void;
  reset: () => void;
}

export function DashboardCustomizer({ order, isVisible, toggleVisibility, reset }: Props) {



  const hiddenCount = order.filter((k) => !isVisible(k)).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
          <Settings2 size={14} />
          <span className="hidden sm:inline">Personalizar</span>
          {hiddenCount > 0 && (
            <span className="flex items-center justify-center min-w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
              {hiddenCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-sm flex flex-col">
        <SheetHeader>
          <SheetTitle>Personalizar dashboard</SheetTitle>
          <p className="text-xs text-muted-foreground">
            Arrastra para reordenar. Toca el ojo para mostrar/ocultar.
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-2">
            {order.map((key) => (
              <Row
                key={key}
                id={key}
                visible={isVisible(key)}
                onToggle={() => toggleVisibility(key)}
              />
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground text-xs gap-2"
            onClick={reset}
          >
            <RotateCcw size={13} />
            Restablecer orden por defecto
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
