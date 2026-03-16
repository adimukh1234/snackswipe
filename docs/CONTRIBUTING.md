# Contributing to Snackswipe

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10 (workspaces support)
- A [Neon](https://neon.tech) PostgreSQL database
- A [Clerk](https://clerk.com) application (for auth)
- A [Razorpay](https://razorpay.com) test account (for payments)

## Setup

```bash
# 1. Clone and install
git clone <repo>
cd snackswipe
npm install

# 2. Configure environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your DB, Clerk, and Razorpay credentials

# Create apps/web/.env.local:
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
EOF

# 3. Run DB migrations
cd apps/api
npx drizzle-kit generate
npx drizzle-kit migrate
cd ../..

# 4. Start both servers
npm run dev
# web → http://localhost:3000
# api → http://localhost:4000
```

## Available Scripts

<!-- AUTO-GENERATED from package.json scripts -->
### Root (run from repo root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start web (port 3000) and API (port 4000) concurrently |
| `npm run dev:web` | Start Next.js frontend only |
| `npm run dev:api` | Start Fastify backend only (with `tsx watch`) |
| `npm run build` | Production build for both apps |
| `npm run build:web` | Next.js production build |
| `npm run build:api` | TypeScript compile API to `dist/` |
| `npm run lint` | ESLint both apps |
| `npm run test:e2e` | Run Playwright E2E tests (requires `dev` running) |

### API (run from `apps/api/`)

| Command | Description |
|---------|-------------|
| `npx drizzle-kit generate` | Generate SQL migration from schema changes |
| `npx drizzle-kit migrate` | Apply pending migrations to Neon DB |
| `npx drizzle-kit studio` | Open browser UI to browse DB tables |

### Web (run from `apps/web/`)

| Command | Description |
|---------|-------------|
| `npm run test:e2e:ui` | Playwright test runner with interactive UI |
<!-- END AUTO-GENERATED -->

## Project Structure

```
snackswipe/
├── apps/
│   ├── web/                  # Next.js 15 consumer PWA
│   │   ├── src/app/          # App Router pages
│   │   ├── src/components/   # UI components
│   │   ├── src/hooks/        # React Query hooks
│   │   ├── src/lib/api.ts    # Typed HTTP client
│   │   ├── src/stores/       # Zustand stores
│   │   └── e2e/              # Playwright tests
│   └── api/                  # Fastify 5 backend
│       └── src/
│           ├── db/schema.ts  # Drizzle schema (source of truth)
│           ├── lib/          # clerk-auth, utilities
│           └── routes/       # dishes, orders, payments, partners
└── docs/                     # This directory
```

## Making Changes

### Adding a new API endpoint

1. Add the route handler in the relevant `apps/api/src/routes/*.routes.ts`
2. Add a Zod schema for the request body/query
3. Use `verifyClerkAuth` for consumer auth or `verifyPartnerAuth` for partner auth
4. Add the corresponding typed method to `apps/web/src/lib/api.ts`
5. Write an E2E test in `apps/web/e2e/`

### Schema changes

Always generate and apply a migration — never edit the DB directly:

```bash
cd apps/api
# 1. Edit src/db/schema.ts
# 2. Generate migration
npx drizzle-kit generate
# 3. Review the generated SQL in ./drizzle/
# 4. Apply
npx drizzle-kit migrate
```

### Running E2E tests

Tests require both dev servers to be running:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test:e2e

# Or with interactive UI:
cd apps/web && npm run test:e2e:ui
```

Tests are in `apps/web/e2e/`:
- `auth.setup.ts` — Clerk global auth setup
- `home.spec.ts` — Home page (header, chips, sections)
- `discover.spec.ts` — Swipe stack, PASS/CRAVE buttons
- `cart.spec.ts` — Cart badge, empty state
- `checkout.spec.ts` — Address form, payment flow
- `orders.spec.ts` — Order history
- `search.spec.ts` — Search modal open/close/query

## Code Style

- TypeScript strict mode — no `any`, handle nulls explicitly
- Zod validation on all API route boundaries (request body + query params)
- Immutable state patterns in Zustand stores
- Framer Motion for all animations (no CSS keyframe animations)
- No unit tests — E2E only (Playwright)

## PR Checklist

- [ ] `npx tsc --noEmit` passes in both `apps/web/` and `apps/api/`
- [ ] `npm run lint` passes
- [ ] New API endpoints have Zod validation
- [ ] Auth-required routes call `verifyClerkAuth` (not JWT)
- [ ] DB schema changes have a generated migration in `apps/api/drizzle/`
- [ ] E2E test added or updated for user-facing changes
