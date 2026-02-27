import { createFileRoute } from "@tanstack/react-router";
import { getGoals } from "@/server/goals.functions";

export const Route = createFileRoute("/goals")({
  loader: () => getGoals(),
  component: GoalsPage,
});

const formatCOP = (n: string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(parseFloat(n));

function GoalsPage() {
  const goals = Route.useLoaderData();

  const monthsBetween = (to: string) => {
    const now = new Date();
    const d = new Date(to);
    return Math.max(
      0,
      (d.getFullYear() - now.getFullYear()) * 12 +
        d.getMonth() -
        now.getMonth(),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Metas de Ahorro</h1>
          <p className="text-muted-foreground">
            Define y monitorea tu progreso.
          </p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          + Nueva Meta
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center border-dashed">
          <p className="text-muted-foreground">No tienes metas definidas.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const current = parseFloat(goal.currentAmount);
            const target = parseFloat(goal.targetAmount);
            const progress =
              target > 0 ? Math.round((current / target) * 100) : 0;
            const remaining = target - current;
            const months = goal.deadline ? monthsBetween(goal.deadline) : null;

            return (
              <div key={goal.id} className="glass rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{goal.name}</h3>
                  <span className="text-sm font-semibold text-primary">
                    {progress}%
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{formatCOP(goal.currentAmount)}</span>
                    <span>{formatCOP(goal.targetAmount)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>Faltan {formatCOP(String(remaining))}</span>
                  {months !== null && <span>{months} meses</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
