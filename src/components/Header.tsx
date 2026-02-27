import { Link } from "@tanstack/react-router";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="flex h-16 items-center px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
            <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)] animate-pulse" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Finova</span>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-border">
            <img
              src="https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4"
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
