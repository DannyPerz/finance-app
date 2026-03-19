import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
export const { forgetPassword, resetPassword } = authClient as typeof authClient & {
  forgetPassword: (opts: { email: string; redirectTo?: string }) => Promise<{ error: { message?: string } | null }>;
  resetPassword: (opts: { newPassword: string; token: string }) => Promise<{ error: { message?: string } | null }>;
};
