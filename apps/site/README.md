# `@pier/site`

Marketing/docs site for Pier built with Next.js App Router.

## Development

From the repo root:

```bash
pnpm --filter @pier/site dev
```

## PostHog Analytics

The site supports production-only PostHog analytics with manual `$pageview` events.

Add environment variables in your deployment (and optionally in `.env.local`):

```bash
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_POSTHOG_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

Behavior:
- Analytics is disabled unless `NODE_ENV=production`.
- Analytics is disabled when `NEXT_PUBLIC_POSTHOG_KEY` is missing.
- Analytics is disabled when the current hostname is not in `NEXT_PUBLIC_POSTHOG_ALLOWED_HOSTS`.
- Autocapture, pageleave capture, session recording, and person profiles are disabled.
