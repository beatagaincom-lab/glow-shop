import Stripe from "stripe";
import { paymentMode, expectedAccount } from "./mode.mjs";
export async function getStripe({ requireCheckout = true } = {}) {
  const mode = paymentMode();
  const key = process.env.STRIPE_SECRET_KEY;
  if (
    (requireCheckout && process.env.CHECKOUT_ENABLED !== "true") ||
    !new RegExp(`^(sk|rk)_${mode}_`).test(key || "")
  )
    throw new Error("checkout_disabled");
  if (mode === "live" && requireCheckout &&
      (!process.env.STRIPE_WEBHOOK_SECRET ||
       !process.env.SUPABASE_URL ||
       !process.env.SUPABASE_SERVICE_ROLE_KEY))
    throw new Error("live_order_store_not_configured");
  const stripe = new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 });
  const account = await stripe.accounts.retrieve();
  if (account.id !== expectedAccount(mode)) throw new Error("wrong_account");
  return stripe;
}
export function appUrl() {
  const value =
    process.env.APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://127.0.0.1:4173");
  const url = new URL(value);
  if (url.protocol !== "https:" && url.origin !== "http://127.0.0.1:4173")
    throw new Error("invalid_origin");
  return url.origin;
}
export function reply(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}
