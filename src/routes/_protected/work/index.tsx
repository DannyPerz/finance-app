import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getWorkMembers } from "@/server/work.functions";
import { Plus, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { CreateWorkMemberModal } from "@/components/modals/CreateWorkMemberModal";
import { DeleteWorkMemberModal } from "@/components/modals/DeleteWorkMemberModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { calculatePayrollCosts } from "@/lib/payroll.utils";
import { WorkMemberInvoiceSheet } from "@/components/WorkMemberInvoiceSheet";
import { getPayrollParameters } from "@/server/work.settings.functions";

export const Route = createFileRoute("/_protected/work/")({
  loader: async () => {
    const members = await getWorkMembers();
    const params = await getPayrollParameters({
      data: { year: new Date().getFullYear() },
    });
    return { members, params };
  },
  component: TeamDashboard,
});

const formatCOP = (n: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(n));

function TeamDashboard() {
  const { members: allMembers, params } = Route.useLoaderData();
  const members = allMembers.filter((m) => m.isActive === "true");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);

  const [memberToShowDetails, setMemberToShowDetails] = useState<any>(null);

  // Calculate actual costs using the mathematical model with DB parameters
  const enrichedMembers = members.map((m) => {
    const costs = calculatePayrollCosts(
      parseFloat(m.baseSalary),
      m.contractType,
      (m.arlLevel as any) || "I",
      params as any,
    );
    return { ...m, ...costs };
  });

  const totalNetToPay = enrichedMembers.reduce(
    (acc, m) => acc + m.netSalaryToPay,
    0,
  );
  const totalRunRate = enrichedMembers.reduce(
    (acc, m) => acc + m.totalEmployerCost,
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
          onClick={() => {
            setMemberToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98]"
        >
          <Plus size={18} />
          Nuevo Miembro
        </button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
        <div className="glass rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            Equipo Activo
          </h3>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {members.length}
          </div>
        </div>
        <div className="glass rounded-xl p-5 shadow-sm col-span-1 border-l-4 border-l-emerald-500">
          <h3 className="text-sm font-medium text-muted-foreground">
            Líquido a Dispersar
          </h3>
          <p className="text-xs text-muted-foreground mb-1">
            Lo que pagas al banco
          </p>
          <div className="text-3xl font-bold text-foreground">
            {formatCOP(totalNetToPay)}
          </div>
        </div>
        <div className="glass rounded-xl p-5 shadow-sm col-span-1 sm:col-span-2 border-l-4 border-l-orange-500">
          <h3 className="text-sm font-medium text-muted-foreground">
            Costo Empresa (Run Rate)
          </h3>
          <p className="text-xs text-muted-foreground mb-1">
            Salarios + Provisiones y Seguridad Social
          </p>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {formatCOP(totalRunRate)}
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
                <th className="px-6 py-4 font-semibold text-right">
                  Base (Bruto)
                </th>
                <th className="px-6 py-4 font-semibold text-right">
                  Costo Total
                </th>
                <th className="px-6 py-4"></th>
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
                enrichedMembers.map((m) => (
                  <tr
                    key={m.id}
                    className="transition-colors hover:bg-muted/30 cursor-pointer"
                    onClick={() => setMemberToShowDetails(m)}
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
                    <td className="px-6 py-4 text-right font-medium">
                      {formatCOP(m.baseSalary)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-orange-600 dark:text-orange-400">
                      {formatCOP(m.totalEmployerCost)}
                    </td>
                    <td
                      className="px-6 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors focus:outline-none ml-auto">
                          <MoreHorizontal
                            size={16}
                            className="text-muted-foreground"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setMemberToEdit(m);
                              setIsModalOpen(true);
                            }}
                          >
                            <Pencil size={14} className="mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => {
                              setMemberToDelete(m);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash size={14} className="mr-2" />
                            Desvincular
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateWorkMemberModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setTimeout(() => setMemberToEdit(null), 200);
        }}
        member={memberToEdit}
        params={params}
      />

      {memberToDelete && (
        <DeleteWorkMemberModal
          open={isDeleteModalOpen}
          onOpenChange={(open) => {
            setIsDeleteModalOpen(open);
            if (!open) setTimeout(() => setMemberToDelete(null), 200);
          }}
          member={memberToDelete}
        />
      )}

      {memberToShowDetails && (
        <WorkMemberInvoiceSheet
          open={!!memberToShowDetails}
          onOpenChange={(open: boolean) =>
            !open && setMemberToShowDetails(null)
          }
          member={memberToShowDetails}
          params={params}
        />
      )}
    </div>
  );
}
