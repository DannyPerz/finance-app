import { Menu } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import ThemeToggle from "./ThemeToggle";

export default function TopBar({ title }: { title: string }) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-lg sm:px-6">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
