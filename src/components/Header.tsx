import { Link, useRouter } from "@tanstack/react-router";
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
import { useSession, signOut } from "@/lib/auth-client";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: "/login" });
  };

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
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-border hover:ring-primary/50 transition-all cursor-pointer">
                  <img
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${session.user.name}&backgroundColor=b6e3f4`}
                    alt={session.user.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 cursor-pointer"
                  onClick={handleSignOut}
                >
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
