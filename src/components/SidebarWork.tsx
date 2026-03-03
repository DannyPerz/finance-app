import { Link, useMatches } from "@tanstack/react-router";
import { Users, CreditCard, Box, PieChart } from "lucide-react";

const navItems = [
  { to: "/work", label: "Equipo", icon: Users },
  { to: "/work/payrolls", label: "Nóminas", icon: CreditCard },
  { to: "/work/ops", label: "Infra & Ops", icon: Box },
  { to: "/work/reports", label: "Reportes", icon: PieChart },
] as const;

export default function SidebarWork() {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "/work";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 flex-col justify-between border-r border-border/40 bg-background/50 backdrop-blur-md lg:flex">
        <nav className="flex flex-col px-4 py-8">
          <div className="space-y-1">
            {navItems.map(({ to, label, icon: IconComp }) => {
              const isActive =
                to === "/work"
                  ? currentPath === "/work"
                  : currentPath.startsWith(to);

              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors no-underline hover:bg-accent ${
                    isActive
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-500"
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
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ to, label, icon: IconComp }) => {
            const isActive =
              to === "/work"
                ? currentPath === "/work"
                : currentPath.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors no-underline ${
                  isActive
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-muted-foreground"
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
