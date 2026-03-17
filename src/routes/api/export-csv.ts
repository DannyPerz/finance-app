import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { transactions, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/api/export-csv")({
  server: {
    handlers: {
      GET: async () => {
        const request = getRequest();
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = session.user.id;

        const result = await db
          .select({
            type: transactions.type,
            amount: transactions.amount,
            description: transactions.description,
            date: transactions.date,
            categoryName: categories.name,
          })
          .from(transactions)
          .leftJoin(categories, eq(transactions.categoryId, categories.id))
          .where(eq(transactions.userId, userId))
          .orderBy(desc(transactions.date), desc(transactions.createdAt));

        const header = "sep=;\nTipo;Monto;Descripción;Categoría;Fecha\n";
        const rows = result
          .map(
            (tx) =>
              `${tx.type === "income" ? "Ingreso" : "Gasto"};${tx.amount};"${(tx.description || "").replace(/"/g, '""')}";"${tx.categoryName || ""}";${tx.date}`,
          )
          .join("\n");

        const csv = "\uFEFF" + header + rows;
        const filename = `finova_movimientos_${new Date().toISOString().slice(0, 10)}.csv`;

        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      },
    },
  },
});
