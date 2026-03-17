import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "users",
  },
  advanced: {
    database: {
      generateId: (options) => {
        if (options.model === "users") {
          // Let PostgreSQL generate UUID with defaultRandom()
          return false;
        }
        return crypto.randomUUID(); // Auto-generate UUIDs for session, account, verification
      },
    },
  },
});
