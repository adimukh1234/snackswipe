# CRAVE — Runbook

Operational reference for running and troubleshooting CRAVE in production.

## Architecture

```
Browser / PWA
    │
    ▼
Next.js 15 (Vercel / any Node host)   ← NEXT_PUBLIC_API_URL
    │
    ▼
Fastify 5 API (any Node host)          ← PORT=4000
    │
    ├─ Clerk (auth token verification)  ← CLERK_SECRET_KEY
    ├─ Neon PostgreSQL (via Drizzle)    ← DATABASE_URL
    └─ Razorpay (payment orders)        ← RAZORPAY_KEY_*
```

## Environment Variables

<!-- AUTO-GENERATED from apps/api/.env.example -->
### API (`apps/api/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string (`?sslmode=require`) |
| `JWT_SECRET` | Yes | Signing key for partner JWT tokens |
| `CLERK_SECRET_KEY` | Yes | Clerk secret for `verifyToken()` in consumer auth |
| `RAZORPAY_KEY_ID` | Yes | Razorpay publishable key (`rzp_test_*` / `rzp_live_*`) |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay secret key for HMAC signature verification |
| `PORT` | No | API listen port (default: `4000`) |
| `FRONTEND_URL` | No | Allowed CORS origin (default: `http://localhost:3000`) |
<!-- END AUTO-GENERATED -->

### Web (`apps/web/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Full API base URL (e.g. `https://api.crave.com`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (`pk_test_*` / `pk_live_*`) |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (for server-side Clerk middleware) |

## Health Check

```bash
curl https://api.crave.com/health
# → { "status": "ok", "timestamp": "..." }
```

## Deployment

### API

```bash
cd apps/api
npm run build          # tsc → dist/
node dist/server.js    # or use pm2 / systemd
```

Ensure `NODE_ENV=production` and all env vars are set before starting.

### Web

```bash
cd apps/web
npm run build          # next build → .next/
npm run start          # next start
```

Or deploy to Vercel — set env vars in the Vercel dashboard.

### DB Migrations (run before every deploy that includes schema changes)

```bash
cd apps/api
npx drizzle-kit generate   # review generated SQL in ./drizzle/
npx drizzle-kit migrate    # applies pending migrations to Neon
```

To verify migrations applied:

```bash
npx drizzle-kit studio     # opens browser UI with all tables
```

Or via SQL:
```sql
SELECT * FROM __drizzle_migrations ORDER BY created_at DESC;
```

## Rate Limits

Configured in `apps/api/src/server.ts`:

| Endpoint | Limit |
|----------|-------|
| All routes | 100 req / min per IP |
| `POST /api/payments/initiate` | 10 req / min per IP |
| `POST /api/payments/verify` | 10 req / min per IP |

## Common Issues

### API returns 401 on all requests
- Verify `CLERK_SECRET_KEY` matches the Clerk app (test vs live key)
- Confirm frontend is sending `Authorization: Bearer <token>` (check `NEXT_PUBLIC_API_URL` points to the right environment)

### Feed endpoint returns 500 after deploy
- Most likely the DB migration wasn't run — `clerkId` or `razorpayOrderId` column missing
- Fix: `cd apps/api && npx drizzle-kit migrate`

### Razorpay payment stuck on "Processing"
- Check `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are production keys (not test) in prod
- Verify `POST /api/payments/verify` is reachable from the browser (CORS, firewall)
- Check HMAC mismatch: signature verification in `payments.routes.ts` uses `razorpay_order_id|razorpay_payment_id`

### CORS errors in browser
- Set `FRONTEND_URL` to the exact origin (no trailing slash): `https://snackswipe.com`
- For multiple origins, update the `cors` plugin config in `apps/api/src/server.ts`

### Collaborative filtering returns empty feed
- User has ≥ 5 swipes but no similar users found → the function falls back to popularity automatically
- If popularity feed is also empty, the `dishes` table may be empty — seed test data

## Key Endpoints Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Health check |
| GET | `/api/dishes/feed` | Optional Clerk | Personalized feed (collab filtering / popular) |
| POST | `/api/dishes/swipe` | Clerk required | Record swipe action |
| GET | `/api/dishes/search?q=` | None | Full-text search |
| GET | `/api/dishes/:id` | None | Single dish detail |
| GET | `/api/dishes/popular` | None | Popularity-ranked list |
| POST | `/api/orders` | Clerk required | Create COD order |
| GET | `/api/orders/history` | Clerk required | User order history |
| POST | `/api/orders/:id/cancel` | Clerk required | Cancel pending order |
| POST | `/api/payments/initiate` | Clerk required | Create Razorpay order |
| POST | `/api/payments/verify` | Clerk required | Verify payment + create order |
| POST | `/api/partners/login` | None | Partner JWT login |
| POST | `/api/partners/dishes` | Partner JWT | Add dish to menu |

## Rollback

If a bad deploy breaks the app:

1. Redeploy the previous commit on your host (Vercel: revert deployment in dashboard)
2. If schema migration was the cause, Drizzle does not auto-rollback — manually revert via SQL or restore a Neon DB snapshot from the Neon console
3. Rotate `CLERK_SECRET_KEY` / `RAZORPAY_KEY_SECRET` if credentials were exposed
