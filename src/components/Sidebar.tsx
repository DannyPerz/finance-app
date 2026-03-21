import { Link, useMatches } from "@tanstack/react-router";
import { LayoutDashboard, ArrowLeftRight, Tags, Settings, PiggyBank } from "lucide-react";

const navItems = [
  { to: "/finance", label: "Dashboard", icon: LayoutDashboard },
  { to: "/finance/transactions", label: "Movimientos", icon: ArrowLeftRight },
  { to: "/finance/categories", label: "Categorías", icon: Tags },
  { to: "/finance/goals", label: "Metas", icon: PiggyBank },
] as const;

export default function Sidebar() {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "/finance";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 flex-col justify-between border-r border-border/40 bg-background/50 backdrop-blur-md lg:flex">
        <nav className="flex flex-col px-4 py-8">
          <div className="space-y-1">
            {navItems.map(({ to, label, icon: IconComp }) => {
              const isActive =
                to === "/finance"
                  ? currentPath === "/finance"
                  : currentPath.startsWith(to);

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
                  <IconComp size={18} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="px-4 pb-8">
          <Link
            to="/finance/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors no-underline hover:bg-accent hover:text-foreground"
          >
            <Settings size={18} />
            Ajustes
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ to, label, icon: IconComp }) => {
            const isActive =
              to === "/finance"
                ? currentPath === "/finance"
                : currentPath.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors no-underline ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <IconComp size={20} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
