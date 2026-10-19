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

This is a test storefront, with a provisional CHF 59.90 price and zero-cost test shipping. No real purchase, shipping or fulfillment occurs. The sandbox session keeps the bag for further testing. Use only synthetic customer data and Stripe test cards.

## Before commercial launch

Confirm merchant details, final tax-inclusive price, shipping charges, stock, delivery/returns and image usage rights. Add complete legal/privacy information. Replace the deliberate test-only gate only after the correct live account is configured. Implement signature-verified Stripe webhooks with durable, idempotent order processing before fulfillment, including asynchronous payment outcomes. A success-page visit is never a fulfillment trigger. Do not enable real payments with the current test-only backend.

No database is required for this catalog and sandbox demonstration. For production inventory, fulfillment and order status, use a durable order store (for example Supabase) and restrict access server-side. Stripe remains the payment source of truth. No database or Supabase project has been provisioned yet.

The preview is excluded from search indexing. Remove preview labels and indexing restrictions only at the agreed launch. Connect the chosen subdomain of bettundbad.ch after DNS and deployment decisions are finalized.

## Images

Product gallery and glow images come from the supplied Kremer catalog. Two editorial scenes were generated using the actual Stars blanket as reference; they are labelled as staged scenes. Manufacturer photos remain authoritative for pattern, color and light effect. Generated scenes do not establish glow intensity or duration. Raw B2B data, purchasing information, source archives and design drafts are intentionally excluded from this repository.

## Interaction design

Warm ivory, midnight blue and soft butter-yellow; Cormorant Garamond and Manrope served locally. The button's circular light moves toward the action; motif changes use short crossfades; the light switch transitions into real manufacturer night photography. Native scrolling, visible image thumbnails, image zoom, persistent bag, and a mobile purchase bar keep the path to purchase direct. Reduced-motion preferences are respected. No tracking or marketing cookies are installed.

Design references: [Material motion](https://m2.material.io/develop/android/theming/motion), [W3C animation accessibility](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [web.dev animation performance](https://web.dev/articles/animations-guide), [Stripe Checkout](https://docs.stripe.com/checkout/quickstart), [Stripe testing](https://docs.stripe.com/testing).
