import { createServerFn } from "@tanstack/react-start";
import { auth } from "@/lib/auth";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Server function to check the current session.
 * Used by route guards (beforeLoad) to protect routes.
 * Returns the session or null if not authenticated.
 */
export const getServerSession = createServerFn().handler(async () => {
  const request = getRequest();
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session;
  } catch {
    // DB unreachable or auth error — treat as unauthenticated
    return null;
  }
});
