import { createFileRoute } from "@tanstack/react-router";
import TopBar from "@/components/TopBar";
import { Plus, Target } from "lucide-react";
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
    <>
      <TopBar title="Metas de Ahorro" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Define tus metas financieras y monitorea tu progreso
            </p>
            <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Nueva Meta
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
              <Target className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No tienes metas definidas aún
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => {
                const current = parseFloat(goal.currentAmount);
                const target = parseFloat(goal.targetAmount);
                const progress =
                  target > 0 ? Math.round((current / target) * 100) : 0;
                const remaining = target - current;
                const months = goal.deadline
                  ? monthsBetween(goal.deadline)
                  : null;

                return (
                  <div
                    key={goal.id}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <Target className="h-8 w-8 text-purple-500" />
                      <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {progress}%
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-foreground">
                      {goal.name}
                    </h3>

                    <div className="mt-3">
                      <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                        <span>{formatCOP(goal.currentAmount)}</span>
                        <span>{formatCOP(goal.targetAmount)}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-muted/50 p-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Faltan
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-foreground">
                          {formatCOP(String(remaining))}
                        </p>
                      </div>
                      {months !== null && (
                        <div className="rounded-lg bg-muted/50 p-2.5">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            ETA
                          </p>
                          <p className="mt-0.5 text-sm font-bold text-foreground">
                            {months} meses
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
