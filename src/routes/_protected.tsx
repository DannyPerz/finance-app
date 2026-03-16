import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { getServerSession } from "@/server/session.functions";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => {
    const session = await getServerSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    return { session };
  },
  component: () => <Outlet />,
});
