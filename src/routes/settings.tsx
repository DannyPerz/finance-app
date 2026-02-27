import { createFileRoute } from "@tanstack/react-router";
import TopBar from "@/components/TopBar";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <TopBar title="Configuración" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
          {/* General */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-foreground">General</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Moneda Base
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Moneda principal para consolidar tus saldos
                  </p>
                </div>
                <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
                  <option>COP - Peso Colombiano</option>
                  <option>USD - Dólar</option>
                  <option>EUR - Euro</option>
                </select>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Formato de Fecha
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cómo se muestran las fechas en la app
                  </p>
                </div>
                <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Notificaciones
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Alerta de Presupuesto al 80%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Notificar cuando alcances el 80% de un presupuesto
                  </p>
                </div>
                <button className="relative h-6 w-11 rounded-full bg-emerald-500 transition">
                  <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition" />
                </button>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Recordatorio de Pagos
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recordar pagos de deuda y gastos recurrentes próximos
                  </p>
                </div>
                <button className="relative h-6 w-11 rounded-full bg-emerald-500 transition">
                  <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition" />
                </button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Categorías
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Personaliza las categorías de ingresos y gastos
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "🍽️ Alimentación",
                "🚗 Transporte",
                "🎮 Entretenimiento",
                "🏥 Salud",
                "📚 Educación",
                "💡 Servicios",
                "📱 Suscripciones",
                "🏠 Vivienda",
              ].map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-foreground"
                >
                  {cat}
                </span>
              ))}
              <button className="inline-flex items-center rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-emerald-500 hover:text-emerald-600">
                + Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
