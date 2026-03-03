import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getWorkMembers } from "@/server/work.functions";
import { Plus } from "lucide-react";
import { CreateWorkMemberModal } from "@/components/modals/CreateWorkMemberModal";

export const Route = createFileRoute("/work/")({
  loader: async () => getWorkMembers(),
  component: TeamDashboard,
});

const formatCOP = (n: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n));

function TeamDashboard() {
  const members = Route.useLoaderData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPayroll = members.reduce(
    (acc, m) => acc + parseFloat(m.netSalary),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Mi Equipo</h1>
          <p className="text-muted-foreground">
            Gestión de roles, salarios y fechas de ingreso.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98]"
        >
          <Plus size={18} />
          Nuevo Miembro
        </button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Tamaño del Equipo
          </h3>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {members.length}
          </div>
        </div>
        <div className="glass rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Nómina Neta Mensual
          </h3>
          <div className="mt-2 text-3xl font-bold text-foreground">
            {formatCOP(totalPayroll)}
          </div>
        </div>
      </div>

      {/* Team Table */}
      <div className="glass overflow-hidden rounded-xl shadow-sm border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/50 bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Nombre & Rol</th>
                <th className="px-6 py-4 font-semibold">Seniority</th>
                <th className="px-6 py-4 font-semibold">Contrato</th>
                <th className="px-6 py-4 font-semibold">Ingreso</th>
                <th className="px-6 py-4 font-semibold text-right">
                  Neto Base
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No tienes miembros en tu equipo aún.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr
                    key={m.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {m.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {m.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {m.seniority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {m.contractType}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {m.startDate}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {formatCOP(m.netSalary)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateWorkMemberModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
