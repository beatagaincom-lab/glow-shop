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

Add the Bett und Bad **sandbox** secret to `.env.local` and set `CHECKOUT_ENABLED=true`. Never commit credentials. The server checks the account identity and rejects live keys in preview/test mode. Live support is prepared behind an explicit production-only configuration gate, but is not activated. Prices and product IDs are validated server-side. A return URL alone cannot confirm payment: the confirmation view retrieves the session from Stripe.

## Preview deployment

Vercel root directory: `shop`. Framework: Vite. Build: `npm run build`. Output: `dist`. The `api` directory contains Vercel Node functions. Set server-only preview environment variables `STRIPE_SECRET_KEY`, `STRIPE_MODE=test`, `CHECKOUT_ENABLED=true`. The deployment URL is used automatically for checkout return URLs; use `APP_URL` only for a fixed canonical origin.

This is a test storefront at CHF 59.90 per blanket. The merchant confirmed free shipping in Switzerland and a planned delivery time of about four days; checkout remains in Stripe test mode and does not ship anything. Use only synthetic customer data and Stripe test cards.

## Before commercial launch

The merchant confirmed Bernard Fries as operator, Bett & Bad as brand, Bellariastrasse 47, 8038 Zürich, and bernardfries7@gmail.com as public contact. He is not VAT-registered, ships orders himself, and accepts returns at the same address. All five motifs are available; exact stock counts have not been supplied and must not be invented. A voluntary 14-day return policy is included. See [OPERATIONS.md](OPERATIONS.md) for the concrete workflow and launch requirements.

Live payments require the production environment, matching live account, canonical domain, matching frontend mode, explicit activation and configured order-store/webhook secrets. No production activation has occurred. The webhook verifies Stripe signatures and stores paid orders idempotently, in separate test/live tables. Pausing new checkouts does not prevent existing payments from being confirmed or stored. A success-page visit is never a fulfillment trigger.

Supabase project `qvcarifkppszjvlhrndn` has private, RLS-enabled `glow_orders` (sandbox) and `glow_live_orders` tables. The new live table is empty and has no anon/authenticated access. Supabase credentials and the sandbox webhook signing secret are configured in Vercel Preview only. The separate Production credential transfer, live webhook, emailed confirmation, full privacy details and live end-to-end acceptance remain pending.

The preview is excluded from search indexing. Remove preview labels and indexing restrictions only at the agreed launch. `glow.bettundbad.ch` is already verified on Vercel, resolves to `76.76.21.21`, and serves an older production build over HTTPS. It is not the latest preview.

## Verified sandbox delivery — 20 October 2026

- Fixed the enabled sandbox endpoint's URL: `x-vercel-set-bypass-cookie` caused an HTTP 307 redirect before the webhook handler. Removed that browser-only parameter while retaining the approved Preview automation bypass. No signing secret was rotated.
- Stripe replay of a previously missing paid event now persisted the order. A second replay left exactly one row.
- A fresh CHF 59.90 Checkout payment completed in the browser with synthetic customer data and a Stripe test card. Its first automatic event delivery created a `livemode=false`, `fulfillment_status=test_only` order without a replay or locally fabricated signature.
- The webhook still targets a pinned protected Preview deployment. Preserve that deployment until the endpoint is intentionally moved and retested.
- Browser returns from Checkout require access to the protected Preview. This is separate from webhook access; never put the webhook bypass credential into browser return URLs.
- Recheck the route with `node --env-file=.env.local scripts/check-webhook-route.mjs`. It sends unsigned empty requests without following redirects and expects the handler's HTTP 400 signature rejection. It never prints credential-bearing URLs or customer data.
- Operator, contact email, no VAT registration, self-fulfillment, return address and general product availability were subsequently confirmed directly by the merchant. The main Bett & Bad site's published imprint contains obvious sample data and must not be copied as legal identity.

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
