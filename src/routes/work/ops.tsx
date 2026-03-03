import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/work/ops")({
  component: OpsPlaceholder,
});

function OpsPlaceholder() {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
      Infraestructura & Ops: Próximamente
    </div>
  );
}
