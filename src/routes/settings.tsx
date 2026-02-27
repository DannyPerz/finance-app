import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground">Configuración de tu cuenta.</p>
      </div>

      <div className="glass rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">General</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div>
              <p className="font-medium">Moneda Base</p>
              <p className="text-xs text-muted-foreground">
                Moneda principal para consolidar saldos
              </p>
            </div>
            <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option>COP - Peso Colombiano</option>
              <option>USD - Dólar</option>
              <option>EUR - Euro</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Formato de Fecha</p>
              <p className="text-xs text-muted-foreground">
                Cómo se muestran las fechas
              </p>
            </div>
            <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Categorías</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Personaliza tus categorías de ingresos y gastos.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Alimentación",
            "Transporte",
            "Entretenimiento",
            "Salud",
            "Educación",
            "Servicios",
            "Suscripciones",
            "Vivienda",
          ].map((cat) => (
            <span
              key={cat}
              className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm"
            >
              {cat}
            </span>
          ))}
          <button className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:text-primary">
            + Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
