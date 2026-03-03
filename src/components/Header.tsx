import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/Icon";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="flex h-16 items-center px-6">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
            <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)] animate-pulse" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Finova</span>
        </Link>

        {/* Right side */}
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />

          {/* App Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background hover:bg-muted transition-colors focus:outline-none">
              <Icon
                name="LayoutGrid"
                size={18}
                className="text-muted-foreground"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Workspace</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to="/"
                  className="flex items-center cursor-pointer w-full"
                >
                  <Icon
                    name="Home"
                    size={16}
                    className="mr-2 text-muted-foreground"
                  />
                  Hub Principal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/finance"
                  className="flex items-center cursor-pointer w-full"
                >
                  <Icon
                    name="LineChart"
                    size={16}
                    className="mr-2 text-green-500"
                  />
                  Finances
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="flex items-center">
                <Icon
                  name="Briefcase"
                  size={16}
                  className="mr-2 text-blue-500"
                />
                Work (Próximamente)
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="flex items-center">
                <Icon
                  name="CheckSquare"
                  size={16}
                  className="mr-2 text-orange-500"
                />
                Flime (Próximamente)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
