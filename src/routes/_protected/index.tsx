import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/_protected/")({
  component: HubPage,
});

function HubPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Workspace
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Selecciona una aplicación para comenzar a trabajar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {/* Finova Suite */}
        <Link
          to="/finance"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-500">
              <Icon name="LineChart" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Finances</h3>
              <p className="text-sm text-muted-foreground">Control personal</p>
            </div>
          </div>
          <p className="text-sm text-foreground/80">
            Gestiona tus ingresos, gastos mensuales, categorías y presupuestos.
          </p>
          <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Abrir app <Icon name="ArrowRight" size={16} className="ml-1" />
          </div>
        </Link>

        {/* Work Suite */}
        <Link
          to="/work"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-500/50"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-500">
              <Icon name="Briefcase" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Work</h3>
              <p className="text-sm text-muted-foreground">Tech Lead</p>
            </div>
          </div>
          <p className="text-sm text-foreground/80">
            Reportes, nóminas, costos y gestión de equipo técnico.
          </p>
          <div className="mt-6 flex items-center text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-500">
            Abrir app <Icon name="ArrowRight" size={16} className="ml-1" />
          </div>
        </Link>

        {/* Flime (Tasks) Suite (Placeholder) */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:shadow-md opacity-75 grayscale hover:grayscale-0 cursor-not-allowed">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-500">
              <Icon name="CheckSquare" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Flime</h3>
              <p className="text-sm text-muted-foreground">
                Tareas & Proyectos
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground/80">
            Gestor de tareas avanzadas, deadlines y tracking de tiempo.
          </p>
          <div className="mt-6 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              Próximamente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
