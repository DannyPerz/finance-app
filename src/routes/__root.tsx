import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import Header from "../components/Header";
import { ThemeProvider } from "../components/ThemeProvider";

import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

const SW_REGISTER_SCRIPT = import.meta.env.DEV
  ? `(function(){if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(sw){sw.unregister();})});}})();`
  : `(function(){if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})});}})();`;

function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 text-center">
      <div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Página no encontrada</p>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Finova — Control Financiero Personal" },
      { name: "description", content: "Control de ingresos, gastos y presupuesto. Tu finanzas personales y OPEX del área de tecnología." },
      { name: "theme-color", content: "#0a0a0f" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased text-foreground bg-background">
        <ThemeProvider defaultTheme="auto">
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex flex-1">
              <main className="flex-1 w-full relative">
                <Outlet />
              </main>
            </div>
          </div>
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Scripts />
          <script dangerouslySetInnerHTML={{ __html: SW_REGISTER_SCRIPT }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
