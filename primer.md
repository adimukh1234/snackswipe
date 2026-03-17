# CRAVE — Session Primer

> Tracks decisions made, work done, and next steps. Update this file as work progresses.

## Session: 2026-03-16

### Decisions Made

| Topic | Decision |
|-------|----------|
| Auth | **Clerk only** — removed custom OTP/JWT system |
| Testing | **E2E only** — Playwright covering login, swipe, cart, checkout |
| Partner UI | **None for now** — partner management stays API-only |
| Priority features | Razorpay payments → Recommendations → Search → API hardening |
| Delivery | **Porter dropped** — no delivery integration |
| R2 Uploads | **Skipped** — partners use URL-based image input |
| Feed algorithm | **Collaborative filtering** with popularity fallback for new users (<5 swipes) |
| Cold start | Fall back to popularity-ranked feed until user has 5+ swipes |
| Frontend | Swipe card physics + micro-interactions + home feed redesign |

---

## Work Done This Session

- [x] Full codebase exploration and architecture analysis
- [x] Created `CLAUDE.md` with commands, architecture, env vars, and key constraints
- [x] **Remove Legacy Auth** — deleted `AuthContext.tsx`, `auth.routes.ts`; removed `authApi` from `api.ts`
- [x] **Playwright E2E setup** — installed `@playwright/test` + `@clerk/testing`; wrote tests for discover, cart, checkout, orders
- [x] **Razorpay Integration** — full end-to-end:
  - API: `POST /api/payments/initiate` + `POST /api/payments/verify`
  - Clerk-Fastify auth bridge via `@clerk/backend` (`verifyToken` → find/create user by `clerkId`)
  - Schema: added `clerkId` to users, `razorpayOrderId` to orders, made `phone` nullable
  - Frontend: checkout page loads Razorpay script, opens checkout for UPI/card, verifies payment; COD works directly
  - `useOrders` hooks pass Clerk session tokens
- [x] **Phase 2: API Hardening** — fully complete:
  - Fixed `dishes.routes.ts` critical auth bug: feed uses `optionalClerkAuth`, swipe uses `verifyClerkAuth`
  - Added `optionalClerkAuth()` to `clerk-auth.ts`
  - Added Zod validation to `dishes.routes.ts` (feed query, swipe body) and `payments.routes.ts` (initiate + verify bodies)
  - Installed `@fastify/rate-limit` — 100 req/min global; 10 req/min on `/api/payments/initiate` and `/api/payments/verify`
- [x] **Phase 3: Collaborative Filtering Feed** — fully complete:
  - `getCollaborativeFeed()`: finds similar users (shared likes), ranks unseen dishes by neighbor overlap score
  - Cold start fallback: users with <5 swipes get popularity-ranked feed
  - Popular dishes pad results if collaborative results are insufficient
- [x] **Phase 5: Frontend UX** — fully complete:
  - **SwipeCard**: stamp scale transforms (snap-in feel), eased rotation curve (slow start, accelerates at edges)
  - **Discover**: particle burst (8 hearts) on swipe right; toast has spring enter / slide-up exit
  - **BottomNav**: cart badge uses `key={itemCount}` for spring bounce on every add
  - **Home**: category chips horizontal scroll with active pill (layoutId spring transition); Shimmer skeleton component replaces pulse on loading states; search button added to header
  - E2E tests added: `home.spec.ts` + `search.spec.ts`
- [x] **Phase 4: Search** — fully complete:
  - `GET /api/dishes/search?q=` endpoint with PostgreSQL ILIKE + tag matching, sorted by name-prefix priority
  - `dishesApi.search()` added to `api.ts`
  - `SearchModal.tsx` now calls the real endpoint instead of fetching 50 dishes client-side
  - `useDishes.ts` `useSwipe()` now passes Clerk token to swipe endpoint

---

## Next Steps (Ordered by Priority)

### Phase 1: DB Migration (prerequisite — do this first)
```bash
cd apps/api
npx drizzle-kit generate:pg   # generates migration file from schema changes
npx drizzle-kit migrate       # applies to Neon DB
```
Schema changes that need migrating:
- `users.clerk_id` (varchar, unique, nullable)
- `users.phone` made nullable (was NOT NULL)
- `orders.razorpay_order_id` replaces `orders.porter_order_id`

---

### Phase 2: API Hardening

#### 2a. Zod Validation on all Fastify routes
- All route bodies/querystrings currently have TypeScript types but no runtime validation
- Add Zod schemas + integrate with Fastify's `schema` option or manual `.parse()`
- **Files to update**: `orders.routes.ts`, `payments.routes.ts`, `partners.routes.ts`, `dishes.routes.ts`

#### 2b. Rate Limiting
- Install `@fastify/rate-limit`
- Apply globally with defaults (100 req/min)
- Stricter limits on `/api/payments/*` (10 req/min) and `/api/orders` (20 req/min)
- **File to update**: `apps/api/src/server.ts`

---

### Phase 3: Collaborative Filtering Feed

**Algorithm design:**
- For users with < 5 total swipes → return popularity-ranked feed (current behavior)
- For users with ≥ 5 swipes:
  1. Find the current user's liked/superliked dish IDs
  2. Find other users who also liked those same dishes (similar users)
  3. Get dishes those similar users liked that the current user hasn't seen
  4. Rank by: (similarity score × like weight) + (global likeCount × 0.1)
  5. Fall back to popular dishes if not enough collaborative results

**SQL approach (no ML needed):**
```sql
-- Similar users: users who liked at least 2 dishes in common
SELECT other_user_id, COUNT(*) as overlap
FROM swipes
WHERE dish_id IN (my_liked_dish_ids)
  AND action IN ('like', 'superlike')
  AND user_id != me
GROUP BY other_user_id
ORDER BY overlap DESC
LIMIT 20;

-- Their liked dishes I haven't seen
SELECT dish_id, SUM(overlap) as score
FROM swipes JOIN above ON user_id = other_user_id
WHERE action IN ('like', 'superlike')
  AND dish_id NOT IN (my_swiped_ids)
GROUP BY dish_id
ORDER BY score DESC;
```

**Files to update**: `apps/api/src/routes/dishes.routes.ts`

Also: fix `verifyAuth` in dishes routes — currently uses JWT cookie, needs to become optional Clerk auth (feed works unauthenticated, swipe requires auth).

**Update `useDishes.ts`**: Pass Clerk token to swipe and optionally to feed.

---

### Phase 4: Search Functionality

The `SearchModal` component exists but calls no API. The `GET /api/dishes/feed?category=X` and `/api/dishes/category/:category` endpoints exist.

**Plan:**
- Add `GET /api/dishes/search?q=query` endpoint (full-text search on name + description + tags)
- Wire `SearchModal` to call the search endpoint (debounced, 300ms)
- Show results in the modal with dish cards

**PostgreSQL FTS approach:**
```sql
WHERE name ILIKE '%query%' OR description ILIKE '%query%' OR 'query' = ANY(tags)
ORDER BY (CASE WHEN name ILIKE 'query%' THEN 0 ELSE 1 END), likeCount DESC
LIMIT 20
```

---

### Phase 5: Frontend UX — Swipe Card Physics

**Goal:** Tinder-quality card feel with spring physics, visual indicators, micro-interactions.

#### 5a. Card Physics (SwipeCard.tsx)
- Velocity-based throw detection (fast flick = instant dismiss, slow drag = snap back)
- Rotation increases with drag distance (currently linear, make it ease-in)
- Spring resistance at edges (card fights back slightly when dragged past threshold)
- CRAVE/PASS stamp overlays that scale with drag confidence
- Stack peek animation: cards 2 and 3 scale up slightly as top card leaves

#### 5b. Micro-interactions
- Button press: scale + ripple on PASS/CRAVE/INFO buttons
- Cart badge: spring bounce when item added
- Toast: slide up with spring, slide down on exit (currently opacity only)
- Like overlay: brief heart particle burst on swipe right
- Loading skeleton: shimmer animation instead of spinner for feed load
- BottomNav: active tab indicator slides with shared layout animation (already has layoutId, can enhance)

#### 5c. Home Feed Redesign (page.tsx)
- Hero section: dish card carousel with parallax scroll
- "Trending Now" row: horizontal scroll with momentum
- Category chips: horizontal scroll with active state pill transition
- Entrance animations: staggered card reveal on page load
- Pull-to-refresh feel on the feed

---

## Known Issues / Tech Debt

| Issue | Severity | Notes |
|-------|----------|-------|
| DB migration not run | High | Schema has `clerkId`, nullable `phone`, `razorpayOrderId` — run `drizzle-kit generate:pg` + `migrate` |
| `cart_items` DB table unused | Low | Cart is Zustand localStorage only |
| `packages/` dir in README | Low | README is aspirational |

---

## Architecture Quick Reference

```
apps/web/src/
├── app/              # Next.js App Router pages
├── components/       # UI components (SwipeCard, DishDetailModal, BottomNav...)
├── hooks/            # useDishes, useOrders (React Query + Clerk token)
├── lib/api.ts        # fetchApi<T>(endpoint, options, token?) — all HTTP calls
└── stores/           # cartStore (Zustand, localStorage)

apps/api/src/
├── server.ts         # Fastify entry: registers all routes + plugins
├── db/schema.ts      # 9-table Drizzle schema (source of truth)
├── lib/clerk-auth.ts # verifyClerkAuth() — Clerk Bearer token → internal userId
└── routes/
    ├── dishes.routes.ts    # feed (optional auth), swipe (Clerk auth)
    ├── orders.routes.ts    # Clerk auth
    ├── payments.routes.ts  # Clerk auth, Razorpay initiate + verify
    └── partners.routes.ts  # JWT auth (partner-specific)
```

## Env Vars Quick Reference

```
apps/api/.env
  DATABASE_URL       Neon PostgreSQL connection string
  JWT_SECRET         Used for partner JWT only
  CLERK_SECRET_KEY   For verifyToken() in clerk-auth.ts
  RAZORPAY_KEY_ID    Test: rzp_test_xxx
  RAZORPAY_KEY_SECRET

apps/web/.env.local
  NEXT_PUBLIC_API_URL                http://localhost:4000
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  pk_test_xxx
  CLERK_SECRET_KEY                   sk_test_xxx
```
