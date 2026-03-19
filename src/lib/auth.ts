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
    sendResetPassword: async ({ user, url }) => {
      console.log(`\n\n= = = = = = = = = = = = = = = = = = = = = = = = = = = = = =`);
      console.log(`🔐 RESET PASSWORD LINK PARA ${user.email} 🔐`);
      console.log(`Haz clic en el siguiente enlace para restablecer tu contraseña:`);
      console.log(url);
      console.log(`= = = = = = = = = = = = = = = = = = = = = = = = = = = = = =\n\n`);
    },
  },
  user: {
    modelName: "users",
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});
