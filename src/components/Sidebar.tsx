import { Link, useMatches } from "@tanstack/react-router";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/accounts", label: "Cuentas" },
  { to: "/transactions", label: "Transacciones" },
  { to: "/budgets", label: "Presupuestos" },
  { to: "/debts", label: "Deudas" },
  { to: "/goals", label: "Metas" },
  { to: "/recurring", label: "Recurrentes" },
] as const;

export default function Sidebar() {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "/";

  return (
    <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 flex-col justify-between border-r border-border/40 bg-background/50 backdrop-blur-md lg:flex">
      <nav className="flex flex-col px-4 py-8">
        <div className="space-y-1">
          {navItems.map(({ to, label }) => {
            const isActive =
              to === "/" ? currentPath === "/" : currentPath.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors no-underline hover:bg-accent ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-4 pb-8">
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors no-underline hover:bg-accent hover:text-foreground"
        >
          Ajustes
        </Link>
      </div>
    </aside>
  );
}
