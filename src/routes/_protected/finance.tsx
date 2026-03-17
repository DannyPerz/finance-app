import { Outlet, createFileRoute } from "@tanstack/react-router";
import Sidebar from "@/components/Sidebar";

export const Route = createFileRoute("/_protected/finance")({
  component: FinanceLayout,
});

function FinanceLayout() {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 w-full lg:pl-64">
        <div className="h-full p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 animate-in-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
