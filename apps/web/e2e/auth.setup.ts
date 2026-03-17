import { clerkSetup } from '@clerk/testing/playwright';

/**
 * Playwright globalSetup — runs once in the main process before any workers start.
 * Sets process.env.CLERK_FAPI and process.env.CLERK_TESTING_TOKEN so that
 * setupClerkTestingToken() works in every test worker.
 *
 * NOTE: clerkSetup() itself calls dotenv internally, so we must let it run before
 * checking env vars — do NOT check process.env.CLERK_PUBLISHABLE_KEY before calling it.
 */
export default async function globalSetup() {
  // clerkSetup reads NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_PUBLISHABLE_KEY,
  // CLERK_SECRET_KEY and CLERK_TESTING_TOKEN — all loaded via dotenv inside it.
  await clerkSetup();
}
