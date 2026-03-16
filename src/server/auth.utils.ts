import { auth } from "@/lib/auth";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Get the authenticated session from the current request.
 * Throws if no session is found.
 */
export async function getAuthSession() {
  const request = getRequest();
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session;
}

/**
 * Get the authenticated user's ID from the current request.
 * Convenience wrapper over getAuthSession().
 */
export async function getAuthUserId(): Promise<string> {
  const session = await getAuthSession();
  return session.user.id;
}
