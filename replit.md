# Xito Tracker

A premium SaaS platform for freelance wedding photographers and videographers to manage clients, projects, files, deadlines, and payments in one command center.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/xito-tracker run dev` — run the frontend (port 21120)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)
- Required env: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — auto-provisioned by Replit Clerk

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, shadcn/ui, Recharts, wouter
- Auth: Clerk (Replit-managed)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/db/src/schema/` — Drizzle table definitions (clients, projects, files, notifications, tags)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/xito-tracker/src/` — React frontend (pages/, components/)
- `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts` — Clerk auth proxy

## Architecture decisions

- Contract-first OpenAPI → codegen pipeline ensures frontend and backend types stay in sync
- Clerk auth proxied through the Express server so both dev and prod use the same auth domain
- PostgreSQL integer column for file sizes (max ~2GB per file record); could migrate to bigint for very large files
- All date fields stored as text (ISO strings) for simplicity; filtered/sorted in application code
- Analytics computed dynamically from raw data rather than a separate aggregation table

## Product

- **Landing page** — SaaS marketing page with features, pricing (3 tiers), testimonials, CTA
- **Auth** — Clerk sign-in/sign-up with Google OAuth support
- **Dashboard** — Stats (clients, projects, revenue, deliveries), charts, upcoming events, notifications
- **Client Management** — Full CRUD with wedding dates, payment tracking, progress, tags, notes
- **Project Tracking** — Kanban board with 5 statuses: Booked → Editing → Preview Sent → Final Delivery → Completed
- **File Manager** — Track file records with availability, backup status, delivery links, download counts
- **Calendar** — Monthly view showing weddings, deadlines, deliveries
- **Notifications** — Grouped by type with mark-as-read functionality
- **Analytics** — Monthly bookings chart, revenue area chart, project status breakdown

## User preferences

- Black, white, and blue premium dark-first UI theme
- No emojis in the UI
- Professional SaaS aesthetic throughout

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Always run `pnpm --filter @workspace/db run push` after changing schema files
- File sizes must fit within PostgreSQL integer range (~2.1GB max); use bigint if larger files needed
- Clerk dev keys show "Development mode" banner — this is expected in dev, auto-switches on publish

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
