import { Link, useMatches } from "@tanstack/react-router";
import { useUIStore } from "@/stores/ui-store";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  Target,
  Landmark,
  Settings,
  ChevronLeft,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/accounts", label: "Cuentas", icon: Wallet },
  { to: "/transactions", label: "Transacciones", icon: ArrowLeftRight },
  { to: "/budgets", label: "Presupuestos", icon: Receipt },
  { to: "/debts", label: "Deudas", icon: Landmark },
  { to: "/goals", label: "Metas", icon: Target },
  { to: "/recurring", label: "Recurrentes", icon: PiggyBank },
  { to: "/settings", label: "Configuración", icon: Settings },
] as const;

export default function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "/";

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-dvh flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out lg:relative lg:z-auto",
          sidebarOpen ? "w-64" : "w-0 lg:w-[72px]",
          !sidebarOpen && "overflow-hidden lg:overflow-visible",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div
            className={cn(
              "flex items-center gap-3 overflow-hidden transition-opacity",
              sidebarOpen ? "opacity-100" : "opacity-0 lg:opacity-100",
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 font-bold text-white shadow-md">
              F
            </div>
            {sidebarOpen && (
              <span className="truncate text-lg font-bold tracking-tight text-sidebar-foreground">
                Finova
              </span>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className={cn(
              "hidden shrink-0 rounded-lg p-1.5 text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-sidebar-foreground lg:block",
              !sidebarOpen && "rotate-180",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === "/" ? currentPath === "/" : currentPath.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors no-underline",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  !sidebarOpen && "lg:justify-center lg:px-0",
                )}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "",
                  )}
                />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-3 py-4">
          <div
            className={cn(
              "flex items-center gap-3 overflow-hidden",
              !sidebarOpen && "lg:justify-center",
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              U
            </div>
            {sidebarOpen && (
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  Usuario
                </p>
                <p className="truncate text-xs text-sidebar-foreground/50">
                  usuario@email.com
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
