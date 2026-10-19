# GLOW · Bett & Bad

Mobile-first storefront for five Flair glow-in-the-dark blankets. React, TypeScript, Vite, Motion and server-side Stripe Checkout on Vercel.

## Run

```sh
cd shop
npm ci
cp .env.example .env.local
npm run dev -- --port 4173
npm test
npm run build
```

Add the Bett und Bad **sandbox** secret to `.env.local` and set `CHECKOUT_ENABLED=true`. Never commit credentials. The server checks the account identity and rejects live keys. Prices and product IDs are validated server-side. The browser only receives a Stripe-hosted Checkout URL. A return URL alone cannot confirm payment: the confirmation view retrieves the session from Stripe.

## Preview deployment

Vercel root directory: `shop`. Framework: Vite. Build: `npm run build`. Output: `dist`. The `api` directory contains Vercel Node functions. Set server-only preview environment variables `STRIPE_SECRET_KEY`, `STRIPE_MODE=test`, `CHECKOUT_ENABLED=true`. The deployment URL is used automatically for checkout return URLs; use `APP_URL` only for a fixed canonical origin.

This is a test storefront at CHF 59.90 per blanket. The merchant confirmed free shipping in Switzerland and a planned delivery time of about four days; checkout remains in Stripe test mode and does not ship anything. Use only synthetic customer data and Stripe test cards.

## Before commercial launch

Confirm the exact legal merchant name, tax treatment, available stock, return policy, delivery process and image usage rights. Add complete legal/privacy information. Replace the deliberate test-only gate only after the correct live account is configured. The sandbox webhook verifies Stripe signatures and writes canonical paid test orders to Supabase with idempotency; it never triggers fulfillment. A success-page visit is never a fulfillment trigger. Do not enable real payments with the current test-only backend.

Supabase project `wmsusxvxpkxnefnxqspn` has a private, RLS-enabled `glow_orders` table for sandbox webhook verification. Service credentials belong only in encrypted Vercel Preview variables. Production inventory, fulfillment access, receipts, returns and refunds still need a defined workflow.

The preview is excluded from search indexing. Remove preview labels and indexing restrictions only at the agreed launch. Connect the chosen subdomain of bettundbad.ch after DNS and deployment decisions are finalized.

## Images

Product and glow images come from the supplied Kremer catalog. The current editorial series contains six reference-based AI scenes: one portrait for each of the five motifs and a wide Stars reading scene. Portrait sources are 1122 × 1402 pixels; the wide source is 1536 × 1024 pixels. Responsive WebP exports use quality 92 without enlargement. Every motif opens with its new lifestyle scene; original manufacturer photographs remain accessible in the same gallery. Generated scenes are explicitly labelled and are illustrative, not exact product photography or evidence of glow intensity. Manufacturer photos remain authoritative for pattern, color and light effect. Raw B2B data, purchasing information and source archives are excluded from this repository.

## Review updates — 19 October 2026

- Product links support `?motiv=hearts#decken` (also stars, unicorn, raket, schmetterlinge). Selecting a motif updates the address without a reload.
- All five products are represented in the light comparison. Hearts and Raket use the original inset comparison and disclose that no standalone night photograph is available.
- Excess quantities are rejected with an explicit message instead of silently clamping the added quantity.
- Checkout controls freeze during a request; duplicate clicks are blocked. Retrying an unchanged cart uses the same Stripe idempotency key. Network errors and a 60-second timeout leave the bag available.
- Cancelling Stripe reopens the saved bag and keeps the purchased motif context.
- The merchant confirmed free shipping within Switzerland and an approximate four-day delivery estimate for launch. Return policy, stock and tax treatment remain unresolved.
- The Stripe connector now exposes the correct Bett und Bad live account. Its read-only implementation planner confirmed hosted one-time Checkout. The storefront still uses its separate sandbox; no live charges or resources were created.
- `glow.bettundbad.ch` is assigned to the Vercel project. Hostpoint DNS resolves to `76.76.21.21` and HTTPS works. The domain still serves an older production build; the latest preview must pass review before any production deployment.
- Vercel still requires a GitHub Login Connection before automatic repository deployments can be connected. Preview deployments are performed through the CLI.

## Interaction design

Warm ivory, midnight blue and soft butter-yellow; Cormorant Garamond and Manrope served locally. The button's circular light moves toward the action; motif changes use short crossfades; the light switch transitions into real manufacturer night photography. Native scrolling, visible image thumbnails, image zoom, persistent bag, and a mobile purchase bar keep the path to purchase direct. Reduced-motion preferences are respected. No tracking or marketing cookies are installed.

Design references: [Material motion](https://m2.material.io/develop/android/theming/motion), [W3C animation accessibility](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [web.dev animation performance](https://web.dev/articles/animations-guide), [Stripe Checkout](https://docs.stripe.com/checkout/quickstart), [Stripe testing](https://docs.stripe.com/testing).

## Day/night comparison update

Five new nighttime edits of the V3 lifestyle images preserve composition for a draggable split comparison. The comparison starts at 50/50, supports direct pointer dragging, a native keyboard-operable slider, and full Day/Night buttons. All five motifs have a paired scene. Manufacturer glow references remain accessible in a disclosure below each scene. The generated night views are visibly labelled as illustrations with unmeasured brightness and duration. Sources are 1122 × 1402 pixels, exported to responsive WebP without enlargement. No real-world luminance or glow-duration claim is made.
