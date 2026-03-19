import { auth } from "@/lib/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")(
  {
    server: {
      handlers: {
        GET: async ({ request }) => {
          return auth.handler(request);
        },
        POST: async ({ request }) => {
          console.log("\n\n=== Better Auth POST ===", request.url);
          return auth.handler(request);
        },
      },
    },
  },
);
