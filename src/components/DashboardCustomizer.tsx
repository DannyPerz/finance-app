import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, RotateCcw, Settings2 } from "lucide-react";
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

function SortableRow({
  id,
  visible,
  onToggle,
}: {
  id: WidgetKey;
  visible: boolean;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 bg-background transition-colors ${
        isDragging ? "border-primary/50 shadow-lg" : "border-border/50"
      } ${!visible ? "opacity-50" : ""}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
        tabIndex={-1}
      >
        <GripVertical size={16} />
      </button>

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
  reorder: (newOrder: WidgetKey[]) => void;
  toggleVisibility: (k: WidgetKey) => void;
  reset: () => void;
}

export function DashboardCustomizer({ order, isVisible, reorder, toggleVisibility, reset }: Props) {

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(active.id as WidgetKey);
      const newIndex = order.indexOf(over.id as WidgetKey);
      reorder(arrayMove(order, oldIndex, newIndex));
    }
  };

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {order.map((key) => (
                  <SortableRow
                    key={key}
                    id={key}
                    visible={isVisible(key)}
                    onToggle={() => toggleVisibility(key)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
