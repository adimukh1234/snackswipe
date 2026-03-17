# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CRAVE** — a swipe-based food discovery and ordering PWA ("Tinder for food"). Users swipe dishes to build a cart, then check out. Food partners manage menus and orders via API.

## Monorepo Structure

```
crave/
├── apps/
│   ├── web/   # Next.js 15 PWA (consumer app)
│   └── api/   # Fastify 5 backend
└── package.json  # workspace root
```

## Commands

```bash
# From repo root
npm install          # install all workspace deps
npm run dev          # start both web (3000) + api (4000)
npm run dev:web      # frontend only
npm run dev:api      # backend only
npm run build        # build both
npm run lint         # lint both
npm run test:e2e     # Playwright E2E tests (requires web dev server running)

# E2E interactive UI (from apps/web/)
npm run test:e2e:ui

# Database migrations (from apps/api/) — run after any schema changes
npx drizzle-kit generate:pg   # generate migration from schema changes
npx drizzle-kit migrate       # apply migrations to Neon DB
```

## Architecture

### Auth
- **Consumer auth**: Clerk only (`@clerk/nextjs` on frontend, `@clerk/backend` on API)
- **Clerk → Fastify bridge**: `apps/api/src/lib/clerk-auth.ts` — `verifyClerkAuth()` verifies Bearer token, finds/creates user row by `clerkId`
- **Partner auth**: custom JWT (Fastify JWT plugin) in `partners.routes.ts` — separate from consumer auth
- **Protected frontend routes**: `/checkout`, `/orders` — guarded by Clerk middleware at `apps/web/src/middleware.ts`

### Frontend (`apps/web/`)
- **App Router** — pages under `src/app/`
- **State**: Zustand (`src/stores/cartStore.ts`) for cart (localStorage key: `crave-cart`), React Query for server state
- **API wrapper**: `src/lib/api.ts` — `fetchApi<T>(endpoint, options, token?)` — pass Clerk token for authenticated endpoints
- **Key pages**: `/discover` (swipe stack), `/cart`, `/checkout`, `/orders`, `/profile`
- **Hooks**: `useOrders` and `useSwipe` pass `getToken()` from `useAuth()` to API calls

### Backend (`apps/api/`)
- **Entry**: `src/server.ts` — registers all plugins and route prefixes
- **DB**: Drizzle ORM over Neon PostgreSQL. Schema in `src/db/schema.ts`
- **Auth flow**: consumer routes call `verifyClerkAuth(request, reply)` which returns internal UUID
- **Routes**: dishes (optional/required Clerk), orders (Clerk), payments (Clerk), partners (JWT)

### Data flow for swipe → order
1. `GET /api/dishes/feed` → collaborative-filtered feed (optional Clerk auth; falls back to popular for <5 swipes)
2. `POST /api/dishes/swipe` → records action, updates counters (Clerk auth required)
3. Cart managed in Zustand (client-side only — `cart_items` DB table is unused)
4. `POST /api/payments/initiate` → creates Razorpay order (UPI/card)
5. `POST /api/payments/verify` → verifies HMAC, creates confirmed order
6. `POST /api/orders` → COD path, creates pending order directly

### Feed Algorithm (collaborative filtering)
- **< 5 swipes**: popularity-ranked (order by `likeCount` DESC)
- **≥ 5 swipes**: collaborative — find users with overlapping likes, recommend their liked dishes the current user hasn't seen. Ranked by similarity score + global popularity
- Feed always excludes dishes the user has already swiped

## Environment Variables

**`apps/api/.env`**:
```
DATABASE_URL=           # Neon PostgreSQL connection string
JWT_SECRET=             # partner JWT signing key (consumers don't use this)
PORT=4000
FRONTEND_URL=http://localhost:3000
CLERK_SECRET_KEY=       # for verifyToken() in clerk-auth.ts
RAZORPAY_KEY_ID=        # test: rzp_test_xxx
RAZORPAY_KEY_SECRET=
```

**`apps/web/.env.local`**:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # pk_test_xxx
CLERK_SECRET_KEY=                    # sk_test_xxx
```

## Key Decisions & Constraints

- **Single partner per order** — cart items must all be from one restaurant (enforced in `orders.routes.ts` + `payments.routes.ts`)
- **No R2 uploads** — partners provide image/video URLs manually; no file upload endpoint planned
- **No delivery integration** — Porter API dropped; delivery is out of scope
- **COD vs Razorpay split**: COD goes through `POST /api/orders`; UPI/card goes through `POST /api/payments/initiate` → Razorpay checkout → `POST /api/payments/verify`
- **E2E tests only** — no unit/integration tests; Playwright in `apps/web/e2e/`
- **Cart is client-side** — Zustand + localStorage is source of truth; `cart_items` DB table not used by frontend
- **Feed auth**: `/api/dishes/feed` uses `optionalClerkAuth` (works unauthenticated); `/api/dishes/swipe` requires Clerk auth
