# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server on port 3000
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm test         # Run tests with Vitest
```

Database migrations are managed via Drizzle Kit — run `pnpm drizzle-kit` commands as needed (push, generate, migrate).

## Architecture

This is a full-stack personal finance app built with **TanStack Start** (React 19, TanStack Router, Nitro). Deployed to **Vercel**.

### Stack
- **Routing/SSR:** TanStack Router (file-based) + TanStack Start
- **Database:** Neon (serverless PostgreSQL) via Drizzle ORM
- **Auth:** Better Auth with Drizzle adapter
- **UI:** Shadcn components, Tailwind CSS 4, Radix UI
- **State:** Zustand (UI state only — sidebar open/closed)
- **Forms:** React Hook Form + Zod
- **Build:** Vite 7 + Nitro (preset switches between `node-server` in dev and `vercel` in production)

### App Module
A single module is reached from the hub at `/`:
- **Finance** (`/finance/*`) — personal budget: transactions, categories, goals, the 100-day savings challenge, settings

### Routing Pattern
File-based routing under `src/routes/`:
- `__root.tsx` — root HTML shell, ThemeProvider, Header, service worker registration
- `_protected.tsx` — layout that checks auth in `beforeLoad`, redirects to `/login` if unauthenticated; passes session into route context
- `_protected/` — all authenticated routes live here
- `api/auth/$.ts` — Better Auth catch-all handler
- `api/export-csv.ts` — CSV export endpoint

Route data is fetched via TanStack Router `loader` functions calling server functions.

### Server Functions
All business logic lives in `src/server/*.functions.ts` files. These are TanStack Start server functions (`createServerFn`). Auth is enforced inside each function via `getAuthUserId()` from `src/server/auth.utils.ts`.

### Database Schema
Two schema files in `src/db/`:
- `schema.ts` — Finance: `users`, `categories`, `transactions` (with recurrence support), `savingsGoals`, `savingsChallenges`
- `auth-schema.ts` — Better Auth tables: `session`, `account`, `verification`

Drizzle client initialized in `src/db/index.ts` using Neon's serverless HTTP adapter.

### Authentication Flow
- Better Auth handles email/password, forgot-password, reset-password
- `src/lib/auth.ts` — server-side auth config
- `src/lib/auth-client.ts` — client-side `createAuthClient()`
- `getAuthSession()` / `getAuthUserId()` in `src/server/auth.utils.ts` — used inside server functions to enforce auth

### Environment Variables
See `.env.example`:
```
DATABASE_URL=          # Neon PostgreSQL connection string
BETTER_AUTH_SECRET=    # Generate: openssl rand -base64 32
BETTER_AUTH_URL=       # e.g. http://localhost:3000
```

### Path Aliases
`#/*` maps to `src/*` (configured in `tsconfig.json` and Vite). Use `#/components/...`, `#/server/...`, etc. for imports.
